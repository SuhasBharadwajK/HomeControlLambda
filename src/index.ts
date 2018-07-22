import * as Alexa from 'alexa-sdk';

export class Handler {
    constructor(event: Alexa.RequestBody, context: Alexa.Context, callback: Function) {
        let alexa = Alexa.handler(event, context);
        alexa.appId = "home_control";

        let handlers: Alexa.Handlers = {
            "AboutIntent": function() {
                let self: Alexa.Handler = this;
                let output: string = "This Alexa skill was developed by Suhas Bharadwaj";
                self.emit(":tellWithCard", output, "Home Control", output);
            },
            "ToggleIntent": function() {
                let self: Alexa.Handler = this;
                let intentRequest = <Alexa.IntentRequest> self.event.request;
            }
        };

        alexa.registerHandlers(handlers);
        alexa.execute();
    }
}