let ok = false;

// Kolla hur det gick
Timer.set(3000, false, function (userdata) {
    if (!ok) {
        print("SOMETHING WENT WRONG!");
    }
    Shelly.call('Switch.Set', {id: 0, on: false});
}, null);

// Stoppa scriptet
Timer.set(4000, false, function (userdata) {
  Shelly.call('Script.Stop', {id: Shelly.getCurrentScriptId()});
}, null)

Shelly.call(
    "KVS.Get",
    { key: "low" },
    function (response, error_code, error_message) {
        if (!response) {
            print("KVS low must be set: "+error_message);
            return;
        }
        low = response.value;
        Shelly.call(
        "KVS.Get",
        { key: "high" },
        function (response, error_code, error_message) {
            if (!response) {
                print("KVS low must be set: "+error_message);
                return;
            }
            high = response.value;
            Shelly.call(
                "KVS.Get",
                { key: "overtemp" },
                function (response, error_code, error_message) {
                    if (!response) {
                        print("KVS overtemp must be set: "+error_message);
                        return;
                    }
                    overtemp = response.value;
                    Shelly.call(
                        "Temperature.GetStatus",
                        { id: 0 },
                        function (response, error_code, error_message) {
                            if (!response) {
                                print("Could not read temperature: "+error_message);
                                return;
                            }
                            temp = response.tC;
                            temp = 50;
                            Shelly.call(
                                "Input.GetStatus",
                                { id: 0 },
                                function (response, error_code, error_message) {
                                    if (!response) {
                                        print("Could not read reset switch: "+error_message);
                                        return;
                                    }
                                    reset = response.state;
                                    Shelly.call(
                                        "Switch.GetStatus",
                                        { id: 1 },
                                        function (response, error_code, error_message) {
                                            if (!response) {
                                                print("Could not read overtemp status: "+error_message);
                                                return;
                                            }
                                            overtempLED = response.output;
                                            overtempLED = false;

                                            if (temp > overtemp) {
                                                msg = "overheat";
                                                // utgång: av
                                                Shelly.call(
                                                    "Switch.Set",
                                                    { id: 0, on: false },
                                                    function (response, error_code, error_message) {}
                                                );           
                                                // överhettningsled: på                         
                                                Shelly.call(
                                                    "Switch.Set",
                                                    { id: 1, on: true },
                                                    function (response, error_code, error_message) {}
                                                );
                                            } else if (reset) {
                                                msg = "reset";
                                                // överhettningsled: av
                                                Shelly.call(
                                                    "Switch.Set",
                                                    { id: 1, on: false },
                                                    function (response, error_code, error_message) {}
                                                );
                                            } else if (overtempLED) {
                                                msg = "overtempLED";
                                                // utgång: av
                                                Shelly.call(
                                                    "Switch.Set",
                                                    { id: 0, on: false },
                                                    function (response, error_code, error_message) {}
                                                );
                                            } else if (temp > high) {
                                                msg = "high temp";
                                                // utgång: av
                                                Shelly.call(
                                                    "Switch.Set",
                                                    { id: 0, on: false },
                                                    function (response, error_code, error_message) {}
                                                );
                                            } else if (temp < low) {
                                                msg = "low temp";
                                                // utgång: på
                                                Shelly.call(
                                                    "Switch.Set",
                                                    { id: 0, on: true },
                                                    function (response, error_code, error_message) {}
                                                );
                                            } else {
                                                msg = "no action";
                                            }
                                            print("low:"+low+" high:"+high+" overtemp:"+overtemp+" T:"+temp+" reset:"+reset+" overtempLED:"+overtempLED+" => " + msg);
                                            ok = true;
                                        });
                                });
                        });
                });
        });
});
