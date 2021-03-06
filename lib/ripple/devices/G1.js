/*
 *  Copyright 2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
module.exports = {

    "id": "G1",
    "name": "HTC G1",
    "model": "G1",
    "osName": "Android",
    "osVersion": "1.6",
    "firmware": "1.6",
    "uuid": "6F196F23-FD0D-4F62-B27B-730147FCC5A3",
    "manufacturer": "HTC",

    "screen": {
        "width": 320,
        "height": 480
    },
    "viewPort": {
        "portrait": {
            "width": 320,
            "height": 480,
            "paddingTop": 0,
            "paddingLeft": 0
        },
        "landscape": {
            "width": 480,
            "height": 320,
            "paddingTop": 0,
            "paddingLeft": 0
        }
    },

    "browser": ["Webkit", "Presto"],
    "ppi": 180.28,
    "platforms": ["web", "wac", "phonegap", "vodafone"],
    "userAgent": "Mozilla/5.0 (Linux; U; Android 1.0; en-us; dream) AppleWebKit/525.10+ (KHTML, like Gecko) Version/3.0.4 Mobile Safari/523.12.2",

    "notes": {
        "1": "<a href=\"http://www.htc.com/www/product/g1/specification.html\" target=\"_blank\">Specs</a>"
    }
};
