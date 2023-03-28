import {UIPlugin} from 'flame-chart-js';

export class MyPlugin extends UIPlugin {
    constructor({name = 'myOwnPlugin'}) {
        super(name);
    }

    height = 100; // height of the plugin in pixels

    // this method will be called on each render
    override render() {
        // do something
        console.log(this);
        this.renderEngine.addRectToRenderQueue('red', 100, 0, 10);
    }
}