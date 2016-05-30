jsPlumb.ready(function () {

    var json = $("#funnelJson").text();
    var funnel = $.parseJSON(json);
    var funnelNodes = {};

    // setup some defaults for jsPlumb.
    var instance = jsPlumb.getInstance({
        Endpoint: ["Dot", {radius: 2}],
        Connector:"StateMachine",
        HoverPaintStyle: {strokeStyle: "#1e8151", lineWidth: 2 },
        ConnectionOverlays: [
            [ "Arrow", {
                location: 1,
                id: "arrow",
                length: 14,
                foldback: 0.8
            } ],
            [ "Label", { label: "FOO", id: "label", cssClass: "aLabel" }]
        ],
        Container: "paper"
    });

    instance.registerConnectionType("basic", { anchor:"Continuous", connector:"StateMachine" });

    window.jsp = instance;

    var canvas = document.getElementById("paper");
    var windows = jsPlumb.getSelector("#paper .w");

    // bind a click listener to each connection; the connection is deleted. you could of course
    // just do this: jsPlumb.bind("click", jsPlumb.detach), but I wanted to make it clear what was
    // happening.
    instance.bind("click", function (c) {
        instance.detach(c);
    });

    // bind a connection listener. note that the parameter passed to this function contains more than
    // just the new connection - see the documentation for a full list of what is included in 'info'.
    // this listener sets the connection's internal
    // id as the label overlay's text.
    instance.bind("connection", function (info) {
        info.connection.getOverlay("label").setLabel(info.connection.id);
    });

    // bind a double click listener to "canvas"; add new node when this occurs.
    jsPlumb.on(canvas, "dblclick", function(e) {
        var nodeId = prompt('Enter nodeId');
        if (nodeId){
            newNode(nodeId, e.offsetX, e.offsetY);
        }
    });

    //
    // initialise element as connection targets and source.
    //
    function initNode(el) {

        // initialise draggable elements.
        instance.draggable(el);

        instance.makeSource(el, {
            filter: ".ep",
            anchor: "Continuous",
            connectorStyle: { strokeStyle: "#5c96bc", lineWidth: 2, outlineColor: "transparent", outlineWidth: 4 },
            connectionType:"basic",
            extract:{
                "action":"the-action"
            },
            maxConnections: 2,
            onMaxConnections: function (info, e) {
                alert("Maximum connections (" + info.maxConnections + ") reached");
            }
        });

        instance.makeTarget(el, {
            dropOptions: { hoverClass: "dragHover" },
            anchor: "Continuous",
            allowLoopback: true
        });

        // this is not part of the core demo functionality; it is a means for the Toolkit edition's wrapped
        // version of this demo to find out about new nodes being added.
        //
        instance.fire("jsPlumbDemoNodeAdded", el);
    }

    function newNode(node) {
        var d = document.createElement("div");
        //var id = jsPlumbUtil.uuid();
        d.className = "w";
        d.id = node.nodeId;
        d.innerHTML = node.nodeId + " <div class=\"ep\"></div>";
        d.style.left = node.x + "px";
        d.style.top = node.y + "px";
        instance.getContainer().appendChild(d);
        initNode(d);
        return d;
    }

    function initConnection(node){
        var nextNodeId;
        var nextNodeIds = [];
        if (node.nextNodeId){
            nextNodeId = node.nextNodeId;
        } else if (node.transition && node.transition.nextNodeId){
            nextNodeId = node.transition.nextNodeId;
        } else if (node.transitions && node.transitions.length){
            for(var i = 0; i < node.transitions.length; i++){
                nextNodeIds.push(node.transitions[i].nextNodeId);
            }
        }

        if (nextNodeIds.length){
            for (var i = 0; i < nextNodeIds.length; i++){
                instance.connect({ source: node.nodeId, target: nextNodeIds[i], type:"basic" });
                if (funnelNodes[nextNodeIds[i]]){
                    initConnection(funnelNodes[nextNodeIds[i]]);
                }
            }
        } else if (nextNodeId) {
            instance.connect({ source: node.nodeId, target: nextNodeId, type:"basic" });
            if (funnelNodes[nextNodeId]){
                initConnection(funnelNodes[nextNodeId]);
            }
        }
    }

    // suspend drawing and initialise.
    instance.batch(function () {
        if (funnel && funnel.nodes && funnel.nodes.length){
            // Finding begin node
            var beginNode;
            for(var i = 0; i < funnel.nodes.length; i++){
                var node = funnel.nodes[i];
                for (var key in node){
                    if (node.hasOwnProperty(key)){
                        if (key==='begin'){
                            beginNode = node[key];
                        }
                        funnelNodes[node[key].nodeId] = node[key];
                        newNode(node[key]);
                    }
                }
            }
        }
        // and finally, make first connection start from begin node
        if (beginNode){
            initConnection(beginNode);
        }
    });

    jsPlumb.fire("jsPlumbDemoLoaded", instance);

});