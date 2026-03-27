"use strict";
/* eslint-disable vue/one-component-per-file */
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const vue_1 = require("vue");
const panelDataMap = new WeakMap();
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
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
    },
    methods: {},
    ready() {
        if (this.$.app) {
            const app = (0, vue_1.createApp)({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.component('EditConfig', (0, vue_1.defineComponent)({
                setup() {
                },
                mounted() {
                    let config = (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../config.json'), 'utf-8');
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
                    onOpenChange(value, platform) {
                        this.$data[platform].open = Number(value);
                    },
                    saveConfig() {
                        let data = {
                            'wechatgame': this.$data['wechatgame'],
                            'bytedance-mini-game': this.$data['bytedance-mini-game'],
                        };
                        (0, fs_extra_1.writeFileSync)((0, path_1.join)(__dirname, '../../../config.json'), JSON.stringify(data));
                    },
                },
                template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/vue/view.html'), 'utf-8'),
            }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvcGFuZWxzL2RlZmF1bHQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLCtDQUErQzs7QUFFL0MsdUNBQXVEO0FBQ3ZELCtCQUE0QjtBQUM1Qiw2QkFBMkQ7QUFDM0QsTUFBTSxZQUFZLEdBQUcsSUFBSSxPQUFPLEVBQVksQ0FBQztBQUM3Qzs7O0dBR0c7QUFDSCx5RkFBeUY7QUFDekYsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUNqQyxTQUFTLEVBQUU7UUFDUCxJQUFJO1FBQ0osQ0FBQztRQUNELElBQUk7UUFDSixDQUFDO0tBQ0o7SUFDRCxRQUFRLEVBQUUsSUFBQSx1QkFBWSxFQUFDLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSw2Q0FBNkMsQ0FBQyxFQUFFLE9BQU8sQ0FBQztJQUMvRixLQUFLLEVBQUUsSUFBQSx1QkFBWSxFQUFDLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSx5Q0FBeUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQztJQUN4RixDQUFDLEVBQUU7UUFDQyxHQUFHLEVBQUUsTUFBTTtLQUNkO0lBQ0QsT0FBTyxFQUFFLEVBRVI7SUFDRCxLQUFLO1FBQ0QsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2IsTUFBTSxHQUFHLEdBQUcsSUFBQSxlQUFTLEVBQUMsRUFBRSxDQUFDLENBQUM7WUFDMUIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsZUFBZSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVFLEdBQUcsQ0FBQyxTQUFTLENBQ1QsWUFBWSxFQUNaLElBQUEscUJBQWUsRUFBQztnQkFDWixLQUFLO2dCQUVMLENBQUM7Z0JBQ0QsT0FBTztvQkFDSCxJQUFJLE1BQU0sR0FBRyxJQUFBLHVCQUFZLEVBQUMsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLHNCQUFzQixDQUFDLEVBQUUsT0FBTyxDQUFRLENBQUE7b0JBQ2xGLElBQUksTUFBTSxFQUFFLENBQUM7d0JBQ1QsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBRTVCLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO3dCQUNoRCxJQUFJLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7b0JBQ3RFLENBQUM7Z0JBQ0wsQ0FBQztnQkFFRCxJQUFJO29CQUVBLE9BQU87d0JBQ0gsWUFBWSxFQUFFOzRCQUNWLElBQUksRUFBRSxDQUFDLEVBQUUsYUFBYTt5QkFDekI7d0JBQ0QscUJBQXFCLEVBQUU7NEJBQ25CLElBQUksRUFBRSxDQUFDLEVBQUUsYUFBYTt5QkFDekI7cUJBQ0osQ0FBQztnQkFDTixDQUFDO2dCQUNELE9BQU8sRUFBRTtvQkFDTCxZQUFZLENBQUMsS0FBYSxFQUFFLFFBQWdCO3dCQUN2QyxJQUFJLENBQUMsS0FBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7b0JBQ3RELENBQUM7b0JBRUQsVUFBVTt3QkFDTixJQUFJLElBQUksR0FBRzs0QkFDUCxZQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUM7NEJBQ3RDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUM7eUJBQzNELENBQUE7d0JBQ0QsSUFBQSx3QkFBYSxFQUFDLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSxzQkFBc0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDakYsQ0FBQztpQkFDSjtnQkFDRCxRQUFRLEVBQUUsSUFBQSx1QkFBWSxFQUFDLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSx3Q0FBd0MsQ0FBQyxFQUFFLE9BQU8sQ0FBQzthQUM3RixDQUFDLENBQ0wsQ0FBQztZQUNGLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0QixZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNoQyxDQUFDO0lBQ0wsQ0FBQztJQUNELFdBQVcsS0FBSyxDQUFDO0lBQ2pCLEtBQUs7UUFDRCxNQUFNLEdBQUcsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLElBQUksR0FBRyxFQUFFLENBQUM7WUFDTixHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbEIsQ0FBQztJQUNMLENBQUM7Q0FDSixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSB2dWUvb25lLWNvbXBvbmVudC1wZXItZmlsZSAqL1xuXG5pbXBvcnQgeyByZWFkRmlsZVN5bmMsIHdyaXRlRmlsZVN5bmMgfSBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBjcmVhdGVBcHAsIEFwcCwgZGVmaW5lQ29tcG9uZW50LCByZWYgfSBmcm9tICd2dWUnO1xuY29uc3QgcGFuZWxEYXRhTWFwID0gbmV3IFdlYWtNYXA8YW55LCBBcHA+KCk7XG4vKipcbiAqIEB6aCDlpoLmnpzluIzmnJvlhbzlrrkgMy4zIOS5i+WJjeeahOeJiOacrOWPr+S7peS9v+eUqOS4i+aWueeahOS7o+eggVxuICogQGVuIFlvdSBjYW4gYWRkIHRoZSBjb2RlIGJlbG93IGlmIHlvdSB3YW50IGNvbXBhdGliaWxpdHkgd2l0aCB2ZXJzaW9ucyBwcmlvciB0byAzLjNcbiAqL1xuLy8gRWRpdG9yLlBhbmVsLmRlZmluZSA9IEVkaXRvci5QYW5lbC5kZWZpbmUgfHwgZnVuY3Rpb24ob3B0aW9uczogYW55KSB7IHJldHVybiBvcHRpb25zIH1cbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yLlBhbmVsLmRlZmluZSh7XG4gICAgbGlzdGVuZXJzOiB7XG4gICAgICAgIHNob3coKSB7XG4gICAgICAgIH0sXG4gICAgICAgIGhpZGUoKSB7XG4gICAgICAgIH0sXG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogcmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3RhdGljL3RlbXBsYXRlL2RlZmF1bHQvaW5kZXguaHRtbCcpLCAndXRmLTgnKSxcbiAgICBzdHlsZTogcmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3RhdGljL3N0eWxlL2RlZmF1bHQvaW5kZXguY3NzJyksICd1dGYtOCcpLFxuICAgICQ6IHtcbiAgICAgICAgYXBwOiAnI2FwcCcsXG4gICAgfSxcbiAgICBtZXRob2RzOiB7XG5cbiAgICB9LFxuICAgIHJlYWR5KCkge1xuICAgICAgICBpZiAodGhpcy4kLmFwcCkge1xuICAgICAgICAgICAgY29uc3QgYXBwID0gY3JlYXRlQXBwKHt9KTtcbiAgICAgICAgICAgIGFwcC5jb25maWcuY29tcGlsZXJPcHRpb25zLmlzQ3VzdG9tRWxlbWVudCA9ICh0YWcpID0+IHRhZy5zdGFydHNXaXRoKCd1aS0nKTtcbiAgICAgICAgICAgIGFwcC5jb21wb25lbnQoXG4gICAgICAgICAgICAgICAgJ0VkaXRDb25maWcnLFxuICAgICAgICAgICAgICAgIGRlZmluZUNvbXBvbmVudCh7XG4gICAgICAgICAgICAgICAgICAgIHNldHVwKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG1vdW50ZWQoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY29uZmlnID0gcmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vY29uZmlnLmpzb24nKSwgJ3V0Zi04JykgYXMgYW55XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnID0gSlNPTi5wYXJzZShjb25maWcpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGF0YVsnd2VjaGF0Z2FtZSddID0gY29uZmlnWyd3ZWNoYXRnYW1lJ107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kZGF0YVsnYnl0ZWRhbmNlLW1pbmktZ2FtZSddID0gY29uZmlnWydieXRlZGFuY2UtbWluaS1nYW1lJ107XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgZGF0YSgpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnd2VjaGF0Z2FtZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlbjogMSwgLyoqIOaYr+WQpuW8gOWQr+S8mOWMliAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2J5dGVkYW5jZS1taW5pLWdhbWUnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW46IDEsIC8qKiDmmK/lkKblvIDlkK/kvJjljJYgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbk9wZW5DaGFuZ2UodmFsdWU6IG51bWJlciwgcGxhdGZvcm06IHN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0aGlzLiRkYXRhIGFzIGFueSlbcGxhdGZvcm1dLm9wZW4gPSBOdW1iZXIodmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlQ29uZmlnKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnd2VjaGF0Z2FtZSc6IHRoaXMuJGRhdGFbJ3dlY2hhdGdhbWUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2J5dGVkYW5jZS1taW5pLWdhbWUnOiB0aGlzLiRkYXRhWydieXRlZGFuY2UtbWluaS1nYW1lJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdyaXRlRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi9jb25maWcuanNvbicpLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3RhdGljL3RlbXBsYXRlL3Z1ZS92aWV3Lmh0bWwnKSwgJ3V0Zi04JyksXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgYXBwLm1vdW50KHRoaXMuJC5hcHApO1xuICAgICAgICAgICAgcGFuZWxEYXRhTWFwLnNldCh0aGlzLCBhcHApO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBiZWZvcmVDbG9zZSgpIHsgfSxcbiAgICBjbG9zZSgpIHtcbiAgICAgICAgY29uc3QgYXBwID0gcGFuZWxEYXRhTWFwLmdldCh0aGlzKTtcbiAgICAgICAgaWYgKGFwcCkge1xuICAgICAgICAgICAgYXBwLnVubW91bnQoKTtcbiAgICAgICAgfVxuICAgIH0sXG59KTtcbiJdfQ==