// panel/index.js, this filename needs to match the one registered in package.json
const fs = require("fs-extra");
const path = require("path");

Editor.Panel.extend({
  // css style for panel
  style: `
    :host {
      margin: 10px;
    }
    .title {
        display: block;
        text-align: center;
        margin: 20px auto;
    }

    .checkbox-container {
        display: block;
        margin: 20px 0;
    }

    .select-container {
        display: block;
        width: 200px;
        margin: 20px 0;
    }

    .input-container {
        display: block;
        width: 100%;
        margin-top: 10px;
    }

    .button-save {
        display: block;
        width: 200px;
        height: 60px;
        margin: 20px auto;
        text-align: center;
        line-height: 60px;
        font-size: 26px;
    }
  `,

  // html template for panel
  template: `
    <div class="view">
        <h1 class="title">首屏渲染优化配置</h1>
        <ui-section folded>
            <div class="header">WechatGame</div>
            <ui-checkbox class="checkbox-container" :checked="!!wechatgame.open"
                @change="onOpenChange($event.target.value, 'wechatgame')">是否启动优化</ui-checkbox>
        </ui-section>
        <ui-section folded>
            <div class="header">Bytedance</div>
            <ui-checkbox class="checkbox-container" :checked="!!bytedance.open"
                @change="onOpenChange($event.target.value, 'bytedance')">是否启动优化</ui-checkbox>
        </ui-section>

        <ui-button class="button-save green" @click="saveConfig">保存配置</ui-button>
    </div>
  `,

  // method executed when template and styles are successfully loaded and initialized
  ready() {
    new window.Vue({
      el: this.shadowRoot,
      created() {
        let config = fs.readFileSync(path.join(__dirname, '../config.json'), 'utf-8')
        if (config) {
          config = JSON.parse(config);

          this.$data['wechatgame'] = config['wechatgame'];
          this.$data['bytedance'] = config['bytedance'];
        }
      },
      data: {
        'wechatgame': {
          open: 1, /** 是否开启优化 */
        },
        'bytedance': {
          open: 1, /** 是否开启优化 */
        },
      },
      methods: {
        onOpenChange(value, platform) {
          (this.$data)[platform].open = Number(value)
        },

        saveConfig() {
          let data = {
            'wechatgame': this.$data['wechatgame'],
            'bytedance': this.$data['bytedance'],
          }

          fs.writeFileSync(path.join(__dirname, '../config.json'), JSON.stringify(data));
        },
      },
    });
  },
});