/* eslint-disable vue/one-component-per-file */

import { readFileSync, writeFileSync } from 'fs-extra';
import { join } from 'path';
import { createApp, App, defineComponent, ref } from 'vue';
const panelDataMap = new WeakMap<any, App>();
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() {
        },
        hide() {
        },
    },
    template: readFileSync(join(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: readFileSync(join(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
    },
    methods: {

    },
    ready() {
        if (this.$.app) {
            const app = createApp({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.component(
                'EditConfig',
                defineComponent({
                    setup() {

                    },
                    mounted() {
                        let config = readFileSync(join(__dirname, '../../../config.json'), 'utf-8') as any
                        if (config) {
                            config = JSON.parse(config);

                            this.$data['wechatgame'] = config['wechatgame'];
                            this.$data['bytedance-mini-game'] = config['bytedance-mini-game'];
                        }
                    },

                    data() {

                        return {
                            'wechatgame': {
                                open: 1, /** 是否开启优化 */
                            },
                            'bytedance-mini-game': {
                                open: 1, /** 是否开启优化 */
                            }
                        };
                    },
                    methods: {
                        onOpenChange(value: number, platform: string) {
                            (this.$data as any)[platform].open = Number(value)
                        },

                        saveConfig() {
                            let data = {
                                'wechatgame': this.$data['wechatgame'],
                                'bytedance-mini-game': this.$data['bytedance-mini-game'],
                            }
                            writeFileSync(join(__dirname, '../../../config.json'), JSON.stringify(data));
                        },
                    },
                    template: readFileSync(join(__dirname, '../../../static/template/vue/view.html'), 'utf-8'),
                }),
            );
            app.mount(this.$.app);
            panelDataMap.set(this, app);
        }
    },
    beforeClose() { },
    close() {
        const app = panelDataMap.get(this);
        if (app) {
            app.unmount();
        }
    },
});
