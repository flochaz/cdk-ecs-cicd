import * as cdk from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";

export interface ApiStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class ApiStack extends cdk.Stack {
  public readonly restApi: apigateway.RestApi;
  public readonly lb: elbv2.NetworkLoadBalancer;
  public readonly vpcLink: apigateway.VpcLink;

  constructor(scope: cdk.Construct, id: string, props: ApiStackProps) {
    super(scope, id);
    this.restApi = new apigateway.RestApi(this, "pinguin-api");
    this.restApi.root.addMethod("ANY");

    // Add private NLB loadbalancer targetting service
    this.lb = new elbv2.NetworkLoadBalancer(this, "LB", {
      vpc: props.vpc,
      internetFacing: false
    });

    this.vpcLink = new apigateway.VpcLink(this, "VpcLink", {
      targets: [this.lb]
    });
  }
}
