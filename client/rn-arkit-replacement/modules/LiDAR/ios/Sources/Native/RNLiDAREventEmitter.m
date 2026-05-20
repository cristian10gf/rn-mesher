#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNLiDAREventEmitter, RCTEventEmitter)

RCT_EXTERN_METHOD(sendMeshUpdate:(NSDictionary *)data)

@end
