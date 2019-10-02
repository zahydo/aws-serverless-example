// @ts-check
'use strict';

const aws = require('aws-sdk');
const codedeploy = new aws.CodeDeploy({apiVersion: '2014-10-06'});

exports.handler = async (event, context, callback) => {

    console.log("Entering PreTraffic Hook!");
    console.log(JSON.stringify(event));

    //Read the DeploymentId from the event payload.
    let deploymentId = event.DeploymentId;
    console.log("deploymentId=" + deploymentId);

    //Read the LifecycleEventHookExecutionId from the event payload
    let lifecycleEventHookExecutionId = event.LifecycleEventHookExecutionId;
    console.log("lifecycleEventHookExecutionId=" + lifecycleEventHookExecutionId);

    for (let index = 0; index < 10; index++) {
      console.log("Unit test: " + index);
    }

    // Prepare the validation test results with the deploymentId and
    // the lifecycleEventHookExecutionId for AWS CodeDeploy.
    let params = {
        deploymentId: deploymentId,
        lifecycleEventHookExecutionId: lifecycleEventHookExecutionId,
        status: 'Succeeded' // status can be 'Succeeded' or 'Failed'
    };

    try {
      await codedeploy.putLifecycleEventHookExecutionStatus(params).promise();
      console.log("putLifecycleEventHookExecutionStatus done. executionStatus=[" + params.status + "]");
      return 'Validation unit test succeeded'
    }
    catch (err) {
      console.log("putLifecycleEventHookExecutionStatus ERROR: " + err);
      throw new Error('Validation unit test failed')
    }

}