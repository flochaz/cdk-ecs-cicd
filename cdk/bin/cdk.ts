#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';

import { ClusterStack } from '../lib/cluster-stack';
import { ApiStack } from '../lib/api-stack';
import { AppStack } from '../lib/app-stack';
import { DevPipelineStack } from '../lib/dev-pipeline-stack';
import { StagingProdPipelineStack } from '../lib/staging-prod-pipeline-stack';

const app = new cdk.App();

// Cluster Stacks - maxAZs of 3 is best practice, but make sure you have no EIP limitations (5 is default)
const devClusterStack = new ClusterStack(app, 'DevCluster', {
    cidr: '10.1.0.0/20',
    maxAZs: 2
});
cdk.Tag.add(devClusterStack, 'environment', 'dev');

const stagingClusterStack = new ClusterStack(app, 'StagingCluster', {
    cidr: '10.1.0.0/20',
    maxAZs: 2
});
cdk.Tag.add(devClusterStack, 'environment', 'dev');

const prodClusterStack = new ClusterStack(app, 'ProdCluster', {
    cidr: '10.3.0.0/20',
    maxAZs: 2
});
cdk.Tag.add(prodClusterStack, 'environment', 'prod');

// CodePipeline stacks
const devPipelineStack = new DevPipelineStack(app, 'DevPipelineStack');
cdk.Tag.add(devPipelineStack, 'environment', 'dev');


const stagingProdPipelineStack = new StagingProdPipelineStack(app, 'StagingProdPipelineStack', {
    appRepository: devPipelineStack.appRepository,
    nginxRepository: devPipelineStack.nginxRepository,
    imageTag: devPipelineStack.imageTag
});
cdk.Tag.add(stagingProdPipelineStack, 'environment', 'prod');

// DevApiStack
const devApiStack = new ApiStack(app, 'DevApiStack', {
    vpc: devClusterStack.vpc
});
cdk.Tag.add(devApiStack, 'environment', 'dev');

// DevAppStack
const devAppStack = new AppStack(app, 'DevAppStack', {
    vpc: devClusterStack.vpc,
    cluster: devClusterStack.cluster,
    //autoDeploy: false,
    appImage: devPipelineStack.appBuiltImage,
    nginxImage: devPipelineStack.nginxBuiltImage,
    restApi: devApiStack.restApi,
    vpcLink: devApiStack.vpcLink,
    lb: devApiStack.lb,
    apiResourceName: 'service1',
    lbAppListenerPort: 8001
});
cdk.Tag.add(devAppStack, 'environment', 'dev');

// StagingApiStack
const stagingApiStack = new ApiStack(app, 'StagingApiStack',  {
    vpc: stagingClusterStack.vpc
});
cdk.Tag.add(devApiStack, 'environment', 'dev');
// StagingAppStack
const stagingAppStack = new AppStack(app, 'StagingAppStack', {
    restApi: stagingApiStack.restApi, 
    vpc: stagingClusterStack.vpc,
    cluster: prodClusterStack.cluster,
    //autoDeploy: false,
    appImage: stagingProdPipelineStack.appBuiltImageStaging,
    nginxImage: stagingProdPipelineStack.nginxBuiltImageStaging,
    vpcLink: stagingApiStack.vpcLink,
    lb: stagingApiStack.lb,
    apiResourceName: 'service1',
    lbAppListenerPort: 8001
});
cdk.Tag.add(stagingAppStack, 'environment', 'staging');

// ProdApiStack
const prodApiStack = new ApiStack(app, 'ProdApiStack', {
    vpc: prodClusterStack.vpc
});
// ProdAppStack
const prodAppStack = new AppStack(app, 'ProdAppStack', {
    restApi: prodApiStack.restApi, 
    vpc: prodClusterStack.vpc,
    cluster: prodClusterStack.cluster,
    //autoDeploy: false,
    appImage: stagingProdPipelineStack.appBuiltImageProd,
    nginxImage: stagingProdPipelineStack.nginxBuiltImageProd,
    vpcLink: prodApiStack.vpcLink,
    lb: prodApiStack.lb,
    apiResourceName: 'service1',
    lbAppListenerPort: 8001
});
cdk.Tag.add(prodAppStack, 'environment', 'prod');

