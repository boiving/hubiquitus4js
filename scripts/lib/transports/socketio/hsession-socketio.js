/*
 * Copyright (c) Novedia Group 2012.
 *
 *     This file is part of Hubiquitus.
 *
 *     Hubiquitus is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     Hubiquitus is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with Hubiquitus.  If not, see <http://www.gnu.org/licenses/>.
 */


define(
    [],
    function(){

        var hSessionSocketIO = function(opts, onMessage){
            this.options = opts;
            this.callback = onMessage;
            this.establishConnection();
            this.listenSubscriptions(); //Starts listening responses to subscriptions
        };

        /**
         * Instantiates a socket to talk to the server
         */
        hSessionSocketIO.prototype.establishConnection = function(){
            var config = {
                server: this.options.gateway.socketio.host.value || 'http://localhost',
                port: this.options.gateway.socketio.port.value || 8080,
                namespace: this.options.gateway.socketio.namespace.value || '/'
            };
            this.socket = io.connect(config.server + ':' + config.port+ config.namespace);
        };
        /**
         * Normalizes connection options so that they can be used.
         * They use as a base the given options
         */
        hSessionSocketIO.prototype.createParameters = function(){
            var parameters = {
                jid: this.options.username.value,
                password: this.options.password.value,
                host: this.options.domain.value,
                port: 5222, //Default value
                domain: this.options.domain.value
            };

            //If a route is specified, the host and the port are different than default
            if(this.options.route.value.length > 0){
                var indSeparator = this.options.route.value.lastIndexOf(":");
                parameters.host = this.options.route.value.slice(0, indSeparator);
                if(this.options.route.value.length > indSeparator+1)
                    parameters.port = this.options.route.value.slice(indSeparator+1);
            }

            return parameters;
        };
        /**
         * Asks the server to connect to XMPP, sends the client's presence
         * and starts listening for messages
         */
        hSessionSocketIO.prototype.connect = function(){
            var data = {};
            data.parameters = this.createParameters();

            //Start the connection
            this.socket.emit('connect', data);
            //Listen for data
            this.socket.on('connect', this.callback);
        };
        /**
         * Asks the server to close the XMPP connection and the open socket
         */
        hSessionSocketIO.prototype.disconnect = function(){
            this.socket.disconnect();
        };
        /**
         * Requests a subscription to an XMPP node to the server
         * The answer of the server is treated by listenSubscriptions
         * @param nodeName - Name of the node to subscribe
         */
        hSessionSocketIO.prototype.subscribe = function(nodeName){
            var data = {
                parameters: this.createParameters(),
                nodeName: nodeName
            };
            //Send data to the server in the correct channel
            this.socket.emit('subscribe', data);
        };
        /**
         * Listens for subscriptions and logs the result
         */
        hSessionSocketIO.prototype.listenSubscriptions = function(){
            this.socket.on('subscribe', function(res){
                if(res.status == 'success')
                    console.log('Subscription to node ' + res.node + ' succeeded');
            });
        }

        //This return is a requireJS way which allows other files to import this specific variable
        return{
            hSessionSocketIO: hSessionSocketIO
        }
    }
);