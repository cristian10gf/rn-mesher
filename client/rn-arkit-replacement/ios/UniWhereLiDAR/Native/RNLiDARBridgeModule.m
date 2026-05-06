#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNLiDARBridgeModule, NSObject)

RCT_EXTERN_METHOD(startScan:(id)config resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(stopScan:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(exportMesh:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end
