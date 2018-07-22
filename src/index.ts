import * as Alexa from 'alexa-sdk';
import * as rc from 'typed-rest-client/RestClient';

export class Handler {
    constructor(event: Alexa.RequestBody, context: Alexa.Context, callback: Function) {
        let alexa = Alexa.handler(event, context);
        var serverUri = "http://www.example.com";
        // var serverPort = "53468";

        let client: rc.RestClient = new rc.RestClient("alexa-lambda", serverUri);

        let handlers: Alexa.Handlers = {
            "AboutIntent": function() {
                let self: Alexa.Handler = this;
                let output: string = "This Alexa skill was developed by Suhas Bharadwaj";
                self.emit(":tellWithCard", output, "Home Control", output);
            },
            "ToggleIntent": function() {
                let self: Alexa.Handler = this;
                let intentRequest = <Alexa.IntentRequest> self.event.request;
                let deviceType: string = intentRequest.intent.slots.DeviceType.value;
                if (deviceType.toLowerCase() != "light") {
                    this.emit(":tell", "This device is not supported yet!");
                }
                else {
                    client.get<DeviceState>("toggle").then(response => {
                        if (response.statusCode == 200 && response.result != null) {
                            this.emit(":tell", `The ${deviceType} has been toggled ${response.result.isDeviceOn ? "on" : "off"}`);
                        }
                        else {
                            this.emit(":tell", "There was an error while I tried to do that. Sorry about that!");
                        }
                    });
                }
            },
            "SwitchIntent": function() {
                let self: Alexa.Handler = this;
                let intentRequest = <Alexa.IntentRequest> self.event.request;
                let deviceType: string = intentRequest.intent.slots.DeviceType.value;
                let deviceState: string = intentRequest.intent.slots.DeviceState.value;

                if (deviceType.toLowerCase() != "light") {
                    this.emit(":tell", "This device is not supported yet!");
                }
                else {
                    var deviceRequest = new DeviceRequest({ requestedState: deviceState.toLowerCase()  });
                    client.create<DeviceState>("switch", deviceRequest).then(response => {
                        if(response.statusCode == 200 && response.result != null) {
                            if (!response.result.isStateUpdated) {
                                this.emit(":tell", `The ${deviceType} is already switched ${deviceState}!`);
                            }
                            else {
                                this.emit(":tell", `The ${deviceType} has been switched ${deviceState}`);
                            }
                        }
                        else {
                            this.emit(":tell", "There was an error while I tried to do that. Sorry about that!");
                        }
                    });
                }
            }
        };

        alexa.registerHandlers(handlers);
        alexa.execute();
    }
}

class DeviceState {
    public isDeviceOn: boolean = false;
    public isStateUpdated: boolean = false;
}

class DeviceRequest {
    public deviceName: string = "";
    public deviceType: string = "";
    public requestedState: string = "";

    constructor(args: any) {
        this.deviceName = args.deviceName || null;
        this.deviceType = args.deviceType || null;
        this.requestedState = args.requestedState || null;
    }
}