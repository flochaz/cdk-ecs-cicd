import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';

export class ApiStack extends cdk.Stack {
    public readonly restApi: apigateway.RestApi;

    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);
        this.restApi = new apigateway.RestApi(this, 'pinguin-api');
        this.restApi.root.addMethod('ANY');

    }
}
