---
title: Jetson Nano
published: 2026-03-30
updated: 2026-04-21
description: Jetson Nano正版与国产版分别的配置
image: /assets/bolg_cover/jetson-nano-about.webp
tags: [Jetson, Nvidia, 镜像]
category: 系统
draft: false
author: larry
password: ""
passwordHint: ""
---

---



# 前言

> 应该是两个版本，一个官方版本（已停产），一个是国产版本SUB



两者核心芯片完全一致：英伟达原厂 4GB Nano 核心（4 核 A57 CPU+128 核 Maxwell GPU、4GB LPDDR4、472GFLOPS 算力），双路 MIPI CSI 摄像头、USB / 网口 / HDMI/DP/GPIO 引脚布局 1:1 兼容，软件 JetPack 驱动通用，AI 推理性能无任何差距。

| 对比项       | 英伟达原装 B01 套件                                          | 国产兼容 B01（B01-T/SUB）                                    |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **存储介质** | 无板载 eMMC，只能 TF 卡启动，需自备 SD 卡                    | 搭载原厂 16GB eMMC 模组，默认内置存储开机，也可 TF/U 盘扩展启动 |
| **供电设计** | 双供电：Micro USB+DC 圆孔；必须插跳帽切换供电，忘插会无法上电 | 取消供电跳帽，DC 直插即用，简化新手操作；部分型号优化供电电路 |
| **M.2 插槽** | 仅 M.2 Key E（仅 WiFi / 蓝牙）                               | 多数升级 M.2 Key M，可加装 NVMe 固态扩容                     |
| **载板产地** | 英伟达原厂 PCB                                               | 国内厂商自研复刻底板                                         |
| **包装外观** | 绿色 NVIDIA 官方彩盒                                         | 国产白 / 蓝 / 黄包装盒，无英伟达原厂包装                     |

- 系统烧录区别
  - 原装 B01
    - 直接将 JetPack 镜像写入 TF 卡，插卡开机即可，无需电脑 SDKManager 烧录。
  - 国产 eMMC 版
    - 必须用 Ubuntu 主机 + SDKManager 工具，通过 USB 线把系统烧进板载 16GB eMMC；
    - 若要 TF 卡启动，需手动修改启动配置文件，多一步操作。

---



# 1. B01(原装)

系统烧录操作逻辑简单，只需下载对应适配镜像写入设备即可。英伟达官方配套镜像底层均为 Ubuntu 18.04；网络上也有第三方打包好的 Ubuntu 20.04 镜像资源可供选用。

## a. 官方镜像

[官方入门页面（含镜像下载入口 + 全平台烧录教程）](https://developer.nvidia.cn/embedded/learn/get-started-jetson-nano-devkit)

## b. 第三方镜像

英伟达官方为 Jetson Nano 适配的原生系统镜像均为 Ubuntu 18.04 版本，若需使用 Ubuntu 20.04 系统，需采用社区维护的第三方适配镜像。目前主流可用镜像资源如下，适配 Jetson Nano 2GB/4GB 全系列机型：

| 镜像来源                 | 维护更新时间 | 下载链接                                                     | 核心特点                                                     | 适配机型与使用场景                                           |
| ------------------------ | ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Jetson-Containers        | 2025.11      | https://github.com/dusty-nv/jetson-containers                | Ubuntu 20.04 容器化镜像，预装适配 Jetson 的 AI 依赖，支持 TensorRT、YOLO 等模型，依托 Docker 实现环境隔离，兼容性极强 | 全系列 Jetson 设备，需依赖 Docker 环境运行，适合轻量化 AI 开发 |
| Qengineering（优先推荐） | 2025.08      | [完整版镜像仓库](https://github.com/Qengineering/Jetson-Nano-Ubuntu-20-image)、[基础版镜像仓库](https://github.com/Qengineering/Jetson-Nano-Ubuntu-20-image?tab=readme-ov-file#bare-image) | 原生 SD 卡直刷镜像，无需容器环境；预装适配 Jetson Nano 的 CUDA 10.2、cuDNN 8.0、OpenCV 4.8、PyTorch 1.13、TensorRT 8.0.1.6，驱动适配稳定，开箱即用 | Jetson Nano 2GB/4GB SD卡版本，适合零基础部署、常规机器视觉与AI开发 |

额外配套资源：ROS2 环境适配指南，可适配该 Ubuntu20.04 系统搭建机器人开发环境

教程地址：[JetsonNano-ROS2](https://github.com/CollaborativeRoboticsLab/JetsonNano-ROS2)

### i. 选型说明

Qengineering 提供两款 Jetson Nano Ubuntu20.04 镜像，经实测验证：
1. **完整版镜像（8.73GB）：** 预装全套深度学习、视觉开发依赖，功能完善、兼容性稳定，无基础环境报错问题，为本项目最终选用版本

[grid]
![1776742598170-d64b090a-0e38-4da8-bc3d-cb90c3265445](https://vip.123pan.cn/1831996731/a_PicBed/system/jetson-nano-about/20260626105945565.webp)
![1776742500831-f2e54f9f-6726-4021-b65e-32853bf7cb8f](https://vip.123pan.cn/1831996731/a_PicBed/system/jetson-nano-about/20260626105856586.webp)
[/grid]

2. **基础版镜像（5.6GB）：** 仅保留纯净系统，无预装AI开发依赖，且存在多项环境适配问题，不推荐使用。

   ![1774864318391-6b80b8f6-f0ac-4993-9734-57810415073b](https://vip.123pan.cn/1831996731/a_PicBed/system/jetson-nano-about/20260626105913005.webp)

### ii. 烧录流程

#### 1. 基础信息

| 用户名 | 密码   |
| ------ | ------ |
| jetson | jetson |

#### 2. 烧录工具与介质要求

- 工具：采用树莓派官方烧录器，实测可成功完成镜像烧录，适配性优于 balenaEtcher；
  ![1774864321762-e0a35216-06a6-4ed9-9232-781c9b9e9f9c](https://vip.123pan.cn/1831996731/a_PicBed/system/jetson-nano-about/20260626110329131.webp)
- 介质：建议使用 64GB 及以上 SD 卡（32GB 卡存储空间不足，无法满足AI开发存储需求）；
- 烧录要求：直接烧录 xz 压缩镜像文件，无需提前解压为 img 格式，避免烧录失败。

### iii. 分区扩容

```bash
# 先安装工具
sudo apt-get install gparted
```

Qengineering 镜像烧录后默认分区容量较小，无法充分利用大容量SD卡空间，需通过 GParted 工具手动扩容，操作命令与步骤如下：

- **可视化扩容步骤**
  1. 打开 GParted 工具，选中设备 /dev/mmcblk0；
  2. 选中系统主分区 /dev/mmcblk0p1，点击「Resize/Move」调整分区大小，将未分配空间全部并入主分区；
  3. 确认扩容参数无误后，提交分区修改操作；
  4. 等待程序执行完成，即可释放全部SD卡存储空间，满足后续开发使用。

[grid]
![1774864321833-b99ae7a0-cd3b-46be-8fb2-3fa355540f17](https://vip.123pan.cn/1831996731/a_PicBed/system/jetson-nano-about/20260626111029680.webp)
![1774864321905-ec1a8768-dd87-4144-a47c-bb1c7faa5501](https://vip.123pan.cn/1831996731/a_PicBed/system/jetson-nano-about/20260626111048637.webp)
[/grid]

[grid]
![1774864322018-89b9e0ff-66ca-4409-96ca-33bac16e3b67](https://vip.123pan.cn/1831996731/a_PicBed/system/jetson-nano-about/20260626111108845.webp)
![1774864322119-3b1f41b4-29a7-4ba7-b13c-7f9b5af62f0d](https://vip.123pan.cn/1831996731/a_PicBed/system/jetson-nano-about/20260626111124703.webp)
![1774864322201-ea6aae3a-2243-488a-b7ba-924d7dc3f6e3](https://vip.123pan.cn/1831996731/a_PicBed/system/jetson-nano-about/20260626111131225.webp)
[/grid]


### iv. 可能出现的问题

```bash
# 无线网卡驱动异常
问题现象：设备搭载 Intel 8265NGW 无线网卡，系统初始状态无法识别网卡，网络连接断断续续、极不稳定。
解决方案：无需手动安装驱动，配置设备子网参数后，网卡可自动适配生效，网络恢复正常稳定连接。

# 补充注意事项
1. 该第三方 Ubuntu20.04 镜像为社区适配版本，未收录在官方入门教程内，属于进阶适配方案；
2. 完整版镜像预装 gcc8、gcc9 双版本编译器，可通过系统命令自由切换，适配各类 CUDA 编译需求；
3. 禁止安装 Chromium 浏览器，会与系统 Snap 组件冲突，推荐使用预装 Firefox 浏览器；
4. 若开机出现 lavapipe 报错，可执行 sudo rm -rf /usr/share/vulkan/icd.d 修复异常。
```

















# 2. B01(国产)

- **参考资料**
  - CSDN 保姆级教程：[国产版 Jetson nano b01 烧录经验帖子](https://link.wtturl.cn/?target=https%3A%2F%2Fblog.csdn.net%2Fweixin_67660471%2Farticle%2Fdetails%2F127693072&scene=im&aid=497858&lang=zh)（含完整烧录、开机配置流程，持续更新）
  - 微雪官方 Wiki
    - 整机开发套件总页：[JETSON NANO - Waveshare Wiki](https://link.wtturl.cn/?target=https%3A%2F%2Fwww.waveshare.net%2Fwiki%2FJETSON-NANO-DEV-KIT%23.E7.B3.BB.E7.BB.9F.E7.8E.AF.E5.A2.83.E6.90.AD.E5.BB.BA&scene=im&aid=497858&lang=zh)
    - SD 卡镜像烧录专项页：[JETSON NANO - Waveshare Wiki](https://link.wtturl.cn/?target=https%3A%2F%2Fwww.waveshare.net%2Fwiki%2FJETSON-NANO-DEV-KIT%23.E6.96.B9.E6.B3.95.E4.BA.8C.EF.BC.9ASD.E5.8D.A1.E5.8F.A6.E5.A4.96.E6.9C.89.E9.95.9C.E5.83.8F&scene=im&aid=497858&lang=zh)
  -  古月居实操文档：[Jetson nano 系统安装](https://link.wtturl.cn/?target=https%3A%2F%2Fwww.guyuehome.com%2Fdetail%3Fid%3D1825492265959485442&scene=im&aid=497858&lang=zh)



## a. 各厂商差异

### i. 创越博

1. **出厂状态说明**
   机器人、AI 入门套件成品已预烧好配套 `linux_for_Tegra` 固件，无需虚拟机重新刷写 eMMC；直接将配套专用镜像写入 SD 卡，插卡上电即可启动。
2. **重刷 eMMC 固件操作规范**
   若需清空重写板载 eMMC，**必须提前加载专属补丁**，步骤如下：
   1. 从厂商网盘下载补丁文件 `overlay_32.7.5_PCN211181.tbz2`；
   2. 将补丁压缩包放置在 linux_for_Tegra` 同级目录，不可放入文件夹内部；
   3. 终端执行解压命令：
      ```bash
      sudo tar xpf overlay_32.7.5_PCN211181.tbz2
      ```
   4. 解压完成后，再执行官方 eMMC 烧写指令。

### ii. 幻尔科技

六足机器人核心板（不适配微雪标准 TF 启动**教程**）

1. **不兼容根源**
   微雪通用教程仅适配单启动分区`1P1`；幻尔原厂 TF 镜像共划分 17 个分区（1P1 ~ 1P17），无法直接套用原有启动逻辑，无法定位有效启动分区。
2. **系统目录差异**
   按微雪教程烧录后的系统，`/boot`目录结构与幻尔原厂镜像不一致，核心差异为：设备树.dtb文件、启动配置 `/boot/extlinux/extlinux.conf` 文件不通用。
3. **临时测试方案**
   可尝试将幻尔原厂镜像完整/boot目录替换到新系统内，验证能否正常引导启动。

### iii. JetPack 适配

Jetson Nano 全系列国产板 JetPack 版本适配

- 烧写国产 Nano 核心板统一使用 JetPack 4.6.x 系列工具，不同小版本存在兼容性区别：
  1. JetPack 4.6.2：教程通用版本，烧录后需按文档修改配置才能正常开机，未测试跳过修改是否会启动失败；
  2. JetPack 4.6.6（4.6.x 最终稳定版）：无需额外修改配置，直接烧录即可完整启动，推荐优先选用。

### iv. 附图

1. **微雪标准教程烧录镜像分区截图**
   ![1774937196467-09abe283-2780-4d29-9f66-a43810959bce](https://vip.123pan.cn/1831996731/a_PicBed/system/jetson-nano-about/20260626112805353.webp)
2. **幻尔机器人原厂 TF 镜像分区截图**
   ![1774937196308-6b198272-d3e6-4d44-8a12-da159af32574](https://vip.123pan.cn/1831996731/a_PicBed/system/jetson-nano-about/20260626112735633.webp)

## b. 配置

微雪电子-官方教程图片留存

来源：[JETSON NANO - Waveshare Wiki](https://www.waveshare.net/wiki/JETSON-NANO-DEV-KIT#.E6.96.B9.E6.B3.95.E4.BA.8C.EF.BC.9ASD.E5.8D.A1.E5.8F.A6.E5.A4.96.E6.9C.89.E9.95.9C.E5.83.8F)   |   [古月居 - Jetson nano 系统安装](https://www.guyuehome.com/detail?id=1825492265959485442)

![1776741412858-01a0d4fd-94e1-421b-8814-0d31b50bcba5](https://vip.123pan.cn/1831996731/a_PicBed/system/jetson-nano-about/20260626113240364.webp)

![1776741528975-e1918203-5171-4852-ad82-e2fc0dfd0ee1](https://vip.123pan.cn/1831996731/a_PicBed/system/jetson-nano-about/20260626113405015.webp)





























