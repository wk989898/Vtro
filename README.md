# Vtro ![Vtro](./tray.ico)
[![GitHub license](https://img.shields.io/github/license/wk989898/Vtro)](https://github.com/wk989898/Vtro/blob/master/LICENSE)
## 介绍

trojan 的 windows 图形界面

## 注意

- 可以订阅和添加节点
- ~~暂时无法更改节点选项,可以删除后再添加~~
- 支持 ping,tcp-ping
- 根据时间改变节点 ( 适用于晚上自动更改连接节点,如果节点质量不好 [try it](https://github.com/wk989898/Vtro/releases/) )    
  `开始结束时间相同视为关闭 默认：'19:30'-'00:30',`
- [Conf 配置](./extra-trojan/conf.json)

  - nodes `array<node>` 节点列表
  - sub `array` 订阅组
  - config `object` 配置

### config

- mode `string` default: `day`  
  &nbsp;&nbsp;`night | day`
- proxy `string` default: `pac`  
  &nbsp;&nbsp;`pac | global | off`  
  |type|host|port|
  |---|----|----|
  |pac|localhost|1082/pac|
  |http|-|1081|
  |socks5|-|1080|
  > 设置 off 后只会开启 socks5 端口 !
- time `object`
  - startTime default: `'17:30'`
  - endTime default: `'00:30'`
- day `node` 白天节点
- night `node` 夜间节点

## 运行

```shell
npm run dist
cd dist
```

## 下载

[点击这里](https://github.com/wk989898/Vtro/releases/)

## Todo

* [x] 更改单个节点
* [ ] 分享节点
* [x] 新的交互设计
* [ ] 更改监听端口

## Credits

[trojan](https://github.com/trojan-gfw/trojan)  
[privoxy](https://www.privoxy.org/)  
[v2rayN](https://github.com/2dust/v2rayN)
