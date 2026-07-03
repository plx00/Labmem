---
title: 摩方 M6s-N100
published: 2026-06-15
updated: 2026-06-15
description: 摩方 M6s-N100相关设置
image: /assets/bolg_cover/morefine-about.webp
tags: [摩方, 小电脑，Intel, X86]
category: 系统
draft: false
author: larry
password: ""
passwordHint: ""
---

---

# 前言

[MOREFINE摩方-深圳市赢元素科技有限公司](http://www.imorefine.com/)

[M6S-N100 - MOREFINE摩方-深圳市赢元素科技有限公司](http://www.imorefine.com/h-pd-87.html)

[百度网盘 请输入提取码](https://pan.baidu.com/s/1axjus1EnvcoxO9I9RRT1Mg#list/path=%2F&parentPath=%2Fsharelink1571710943-541945233883075)

[「MOREFINE 摩方 M6S N100 mini 主机」评测：能否成为你的新宠？](https://post.smzdm.com/p/aev7emnk/)



摩方 M6s-N100 配备了 Intel 主处理器，支持标准的 X86 系统安装流程。用户可以通过 ISO 文件创建系统启动介质，并据此进行操作系统的安装。在 BIOS 设置中，可使用 `F7` 快捷键访问启动菜单。



# 1. 快捷键

**（开机出现摩方 Logo 时，连续快速敲击）**

- **Del / Delete 键** → **进入 BIOS 设置**
- **F7 键** → **快捷键访问启动菜单**
- **F4 键** → **BIOS 内：保存设置并退出**
- **Esc 键** → **BIOS 内：返回上一级 / 不保存退出**

# 2. 上电自启

简略说明：

- 进入 **Chipset → PCH-IO Configuration**
- **Wake on Power (Automatic on)** → **S0 State**
- 按 **F4** 保存 → 测试：拔电 10 秒 → 插电 **直接开机**

[grid]
![1776393239554-2b33d59d-6a02-4d0a-8656-b50bac2c1c2b](https://vip.123pan.cn/1831996731/a_PicBed/system/morefine-about/20260625232554256.webp)
![1776393258347-7d65397a-1ebc-482d-a3df-f3e33a00e361](https://vip.123pan.cn/1831996731/a_PicBed/system/morefine-about/20260625232606812.webp)
![1776393286773-ebae1486-e89e-4f24-a629-467e862ad66c](https://vip.123pan.cn/1831996731/a_PicBed/system/morefine-about/20260625232623909.webp)
[/grid]

- [Advanced Configuration and Power Interface (ACPI) States Supported - 003 - ID:655258 | Core™ Processors](https://edc.intel.com/content/www/cn/zh/design/ipla/software-development-platforms/client/platforms/alder-lake-desktop/12th-generation-intel-core-processors-datasheet-volume-1-of-2/003/advanced-configuration-and-power-interface-acpi-states-supported/)
- [极摩客G3如何通电后自动开机？上电开机看这里！](https://www.iesdouyin.com/share/video/7415890474453486887)（这个视频是对应的）

- [来电自启功能设置 | 零刻知识库](https://doc.bee-link.com.cn/books/eqi12-bios/page/0a09c)

 （这个教程有差别但是只是名字不同，功能区都是一样的）

## a. 功能说明

「来电自启」(AC Power Auto Recovery)是一项允许电脑在意外断电后，当电力恢复时自动开机的BIOS功能。这项功能特别适用于：

- 服务器/工作站（24小时不间断运行）
- 智能家居控制中心
- 远程访问主机
- 监控系统主机

## b. 安全须知

1. 建议连接UPS不间断电源，避免频繁断电损伤硬件
2. 潮湿环境或雷雨天气建议暂时关闭此功能
3. 长期不使用时请切断电源总开关

## c. 详细设置步骤

### i. 进入BIOS设置界面

1. **完全关机**（非重启）
2. 按下电源键开机
3. **立即连续敲击Del键**（每秒2-3次）

   ![1776393527887-3a9df3de-f14d-49f5-a2d8-5b57f718cdd3](https://vip.123pan.cn/1831996731/a_PicBed/system/morefine-about/20260625233008585.webp)

   💡 部分品牌可能使用：F2、F10、Esc键（观察开机左下角提示）

### ii. 导航至电源设置

**Main → Chipset → PCH-IO Configuration → State After G3(Wake on Power (Automatic on))**

[grid]
![1776393527939-8897679e-a9d6-4329-8550-3e93910b6bd8](https://vip.123pan.cn/1831996731/a_PicBed/system/morefine-about/20260625233133385.webp)
![1776393528134-fde9af18-cbc1-4ae1-9fe0-8e75428ee8c0](https://vip.123pan.cn/1831996731/a_PicBed/system/morefine-about/20260625233140424.webp)
[/grid]

### iii. 关键选项说明

| 选项值   | 功能说明     | 适用场景                  |
| -------- | ------------ | ------------------------- |
| S0 State | 来电自动开机 | 服务器/需要自动恢复的场景 |
| S5 State | 保持关机状态 | 普通家用电脑默认设置      |

![1776393528143-32c12680-a516-428d-aecd-4452efd95697](https://vip.123pan.cn/1831996731/a_PicBed/system/morefine-about/20260625233332954.webp)

### iv. 保存设置

1. 按`F4`键调出保存对话框
2. 选择`Yes`确认
3. 系统将自动重启

![1776393528309-d2076255-7896-425d-96b7-6d87f7bbd103](https://vip.123pan.cn/1831996731/a_PicBed/system/morefine-about/20260625233357003.webp)

### v. 功能验证与排错

#### 1. 验证方法

1. 保持系统正常关机状态
2. 拔掉电源线等待10秒
3. 重新接通电源
4. 观察是否自动启动

#### 2. 常见问题排查

| 问题现象     | 可能原因     | 解决方案                               |
| ------------ | ------------ | -------------------------------------- |
| 无法进入BIOS | 按键时机不对 | 从关机状态启动，LOGO出现前开始连续敲击 |
| 找不到选项   | BIOS版本差异 | 尝试搜索"AC Recovery"或"Power Loss"    |
| 设置不生效   | CMOS电池故障 | 更换主板电池                           |


---

