import core = require("@aws-cdk/core");
import apigateway = require("@aws-cdk/aws-apigateway");
import lambda = require("@aws-cdk/aws-lambda");
import s3 = require("@aws-cdk/aws-s3");
import codedeploy = require('@aws-cdk/aws-codedeploy');
import cloudwatch = require('@aws-cdk/aws-cloudwatch');

export class WidgetService extends core.Construct {
  constructor(scope: core.Construct, id: string) {
    super(scope, id);
    const bucket = new s3.Bucket(this, 'ServerlessWidgetStore', {bucketName: 'bucket-in-lambda-serverless-example'});
    const application = new codedeploy.LambdaApplication(this, "ServerlessLambdaApplication", {
      applicationName: "serverless_lambda_application"
    });
    const handler = new lambda.Function(this, "ServerlessWidgethandler", {
      runtime: lambda.Runtime.NODEJS_8_10,
      code: lambda.Code.asset("resources"),
      handler: "widgets.main",
      environment: {
        BUCKET: bucket.bucketName
      },
      functionName: "lambda_in_serverless"
    });

    bucket.grantReadWrite(handler);

    // Version and Alias to manage traffic shiffting
    const version = handler.addVersion('5');
    const alias = new lambda.Alias(this, 'ServerlessLambdaAlias', {
      aliasName: 'prod',
      version: version,
    });
    // Lambda function to execute before traffic shiffting
    const preHook = new lambda.Function(this, 'ServerlessPreHook', {
      code: lambda.Code.asset('resources'),
      handler: 'prehook.handler',
      runtime: lambda.Runtime.NODEJS_8_10,
      functionName: 'prehook_in_serverless',
      environment: {
        CurrentVersion: version.toString()
      }
    });

    const deploymentGroup = new codedeploy.LambdaDeploymentGroup(this, 'ServerlessLambdaDeploymentGroup', {
      alias: alias,
      application: application,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.CANARY_10PERCENT_5MINUTES,
      deploymentGroupName: 'serverless_deployment_group',
      preHook: preHook,
    });

    deploymentGroup.addAlarm(new cloudwatch.Alarm(this, 'ServerlessErrorsAlarm', {
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      threshold: 1,
      evaluationPeriods: 1,
      metric: alias.metricErrors(),
      alarmName: 'serverless_errors_alarm'
    }));

    new apigateway.LambdaRestApi(this, 'ServerlessLambdaRestApi', {
      handler: alias.lambda,
      retainDeployments: true
    });
  }
}