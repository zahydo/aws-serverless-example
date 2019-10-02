import cdk = require('@aws-cdk/core');
import { WidgetService } from './widget_service';

export class ServerlessStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new WidgetService(this, 'Widgets');
  }
}
