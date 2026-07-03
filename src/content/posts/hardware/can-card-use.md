---
title: CAN 卡调试
published: 2026-03-20
updated: 2026-03-20
description: CAN 卡驱动、调试、资料
image: /assets/bolg_cover/can-card-use.webp
tags: [CAN, 调试, 快速体验]
category: 硬件调试
draft: false
author: larry
password: ""
passwordHint: ""
---

---

# 前言
>记录几种CAN的使用方法，基本是一致的



# 1. KH-UCANFDX6-Mini

- **鲲弘6通道Can卡**
  
   ![1774861802312-018fca9e-ff94-4d85-96e8-d77ac6ccb644](https://vip.123pan.cn/1831996731/a_PicBed/hardware/can-card-use/20260628224928507.webp)
   
- 相关资料链接：

   | 资源名称                            | 链接                                                         |
   | ----------------------------------- | ------------------------------------------------------------ |
   | Windows 报文收发软件PCAN-View       | [guides/view.md · 成都鲲弘电子科技有限公司/KH-PCAN-guide - Gitee.com](https://gitee.com/ChengDu-KunHong/kh-pcan-guide/blob/master/guides/view.md#https://gitee.com/link?target=https%3A%2F%2Fbj4633.apps.aliyunfile.com%2Fdisk%2Fs%2FcEPHJHd3YyS%3FdomainId%3Dbj4633) |
   | Windows驱动安装                     | [guides/driver.md · 成都鲲弘电子科技有限公司/KH-PCAN-guide - Gitee.com](https://gitee.com/ChengDu-KunHong/kh-pcan-guide/blob/master/guides/driver.md) |
   | 二次开发包                          | [guides/api.md · 成都鲲弘电子科技有限公司/KH-PCAN-guide - Gitee.com](https://gitee.com/ChengDu-KunHong/kh-pcan-guide/blob/master/guides/api.md)、[成都鲲弘电子科技有限公司/KH-PCAN-guide - 码云 - 开源中国](https://gitee.com/ChengDu-KunHong/kh-pcan-guide/tree/master#/ChengDu-KunHong/kh-pcan-guide/blob/master/guides/api.md) |
   | 6通道USB CANFD裸板模块              | [products/can-communication/KH-UCANFDX6-Mini.md · 成都鲲弘电子科技有限公司/CD-KunHong - Gitee.com](https://gitee.com/ChengDu-KunHong/cd-kunhong/blob/master/products/can-communication/KH-UCANFDX6-Mini.md) |
   | KH-UCANFD_Linux_SDK的releases发行版 | [KH-UCANFD_Linux_SDK 发行版 - Gitee.com](https://gitee.com/ChengDu-KunHong/KH-UCANFD_Linux_SDK/releases/) |
   | KH-UCANFD_Linux_SDK的使用介绍       | [成都鲲弘电子科技有限公司/KH-UCANFD_Linux_SDK](https://gitee.com/ChengDu-KunHong/KH-UCANFD_Linux_SDK/) |

## a. 驱动安装

**USB连接线束必须选一根好一点的，要不然会出现无法识别设备的问题。**

### i. Windows

参考操作 Windows驱动安装：[guides/driver.md · 成都鲲弘电子科技有限公司/KH-PCAN-guide - Gitee.com](https://gitee.com/ChengDu-KunHong/kh-pcan-guide/blob/master/guides/driver.md)

- **获取驱动**

  通过网盘在线下载驱动文件压缩包，驱动下载链接：[https://bj4633.apps.aliyunfile.com/disk/s/J5Xan8F9y8n?domainId=bj4633](https://gitee.com/link?target=https%3A%2F%2Fbj4633.apps.aliyunfile.com%2Fdisk%2Fs%2FJ5Xan8F9y8n%3FdomainId%3Dbj4633)

![img](https://vip.123pan.cn/1831996731/a_PicBed/hardware/can-card-use/20260628225256569.webp)

- **驱动安装**
  1. 解压文件：下载完成后，解压压缩包
  2. 运行安装程序：双击运行“PeakOemDrv.exe”
     ![nu1ll](https://vip.123pan.cn/1831996731/a_PicBed/hardware/can-card-use/20260628225327635.webp)
  3. 选择安装配置：根据需求选择配置安装选项（推荐选择全部驱动配置）
     ![nu2ll](https://vip.123pan.cn/1831996731/a_PicBed/hardware/can-card-use/20260628225327584.gif)
  4. 完成安装：按照提示完成后续安装步骤
     后续默认安装即可
- **连接适配器**
  驱动安装完成后，连接适配器到电脑的USB口，Windows设备管理器顺利识别到驱动，则安装成功。
  ![null](https://vip.123pan.cn/1831996731/a_PicBed/hardware/can-card-use/20260628225327544.webp)

### ii. Linux	

参考操作 KH-UCANFD_Linux_SDK的使用介绍：[成都鲲弘电子科技有限公司/KH-UCANFD_Linux_SDK](https://gitee.com/ChengDu-KunHong/KH-UCANFD_Linux_SDK/)，详细的内容进入查看文档

#### 1. 系统环境需求

- Linux系统运行32位或64位内核
- make、gcc编译工具
- Linux系统的内核头文件包（或Linux头文件包），或交叉编译内核的源码树
- g++编辑器及libstdc++库
- libpopt-dev包

#### 2. 依赖安装命令

安装驱动前，请先确认系统环境满足以上需求，可执行以下命令安装依赖：

```bash
# 1. 安装编译基础工具
sudo apt update && sudo apt install -y build-essential g++

# 2. 安装内核头文件（必须与当前内核版本匹配）
sudo apt install -y linux-headers-$(uname -r)

# 3. 安装libpopt依赖
sudo apt install -y libpopt-dev

# 4. 验证gcc版本（需与内核编译版本一致，查询方法如下）
cat /boot/config-$(uname -r) | grep -i "gcc_version"
# 示例输出：CONFIG_GCC_VERSION=120300（表示需安装gcc-12）
# 若版本不匹配，安装对应gcc：sudo apt install -y gcc-12
```

#### 3. SDK下载

可在releases中手动下载，或使用wget。

```bash
# 安装wget（若未安装）
sudo apt install -y wget

# 下载SDK（最新版本）
wget https://gitee.com/ChengDu-KunHong/KH-UCANFD_Linux_SDK/releases/download/latest/KH-UCANFD_Linux_SDK.zip

# 解压SDK
unzip KH-UCANFD_Linux_SDK.zip

# 进入SDK目录（替换x.y.z为实际版本号）
cd KH-UCANFD_Linux_SDK_x.y.z/
```

#### 4. 编译与安装

- **脚本自动安装**

  进入SDK目录后，执行以下命令完成一键安装：

  ```bash
  # 进入SDK目录后，执行以下命令完成一键安装：
  # 执行编译脚本
  ./build.sh
  
  # build.sh 脚本使用说明：
  Usage:
    ./build.sh                    安装驱动
    ./build.sh -c                 交叉编译驱动
    ./build.sh -rules             安装驱动并加载udev命名规则
    ./build.sh -u                 卸载驱动
    ./build.sh -uninstall         卸载驱动
    ./build.sh -h                 显示帮助信息
  ```

- **手动安装**

  ```bash
  执行以下命令完成驱动编译和安装：
  # 清理历史编译文件
  sudo make clean
  
  # 编译驱动（若报错，检查依赖是否齐全、gcc版本是否匹配）
  sudo make netdev
  
  # 安装驱动（无报错则安装成功）
  sudo make install
  ```

#### 5. 驱动加载验证

```bash
# 加载kcan驱动模块
sudo modprobe kcan

# 验证驱动是否加载成功（输出含"kcan"即正常）
lsmod | grep kcan
```

![img](https://vip.123pan.cn/1831996731/a_PicBed/hardware/can-card-use/20260628230246768.webp)

重新拔插 CAN FD 设备后，执行以下命令确认设备被识别：

```bash
# 查看CAN接口信息（输出含"can0"、"can1"等接口即正常）
ip -d link show
```

![nxxull](https://vip.123pan.cn/1831996731/a_PicBed/hardware/can-card-use/20260628230257264.webp)

```bash
# 查看USB设备驱动绑定（输出含"Driver=kcan"即正常）
lsusb -t
```

![nuccll](https://vip.123pan.cn/1831996731/a_PicBed/hardware/can-card-use/20260628230257680.webp)

#### 6. 交叉编译

通过自动编译脚本可以帮助你更简单的完成交叉编译，操作步骤如下：

- 准备交叉编译环境：安装交叉编译工具链、内核源代码等。
- 打开SDK目录下的cross_compile_config.sh，修改相应路径。

```bash
export ARCH=arm64  # 设置目标架构为ARM64
export CROSS_COMPILE=/path/to/your/toolchain/bin/aarch64-linux-gnu-  # 设置交叉编译工具链路径
export KERNEL_LOCATION=/path/to/your/kernel-source/  # 设置内核源代码路径
```

- 执行编译脚本：

```bash
./build.sh -c
```

![null](https://vip.123pan.cn/1831996731/a_PicBed/hardware/can-card-use/20260628230321892.webp)

#### 7. 卸载驱动

```bash
# 使用脚本卸载
sudo ./build.sh -u

# make 卸载
sudo make uninstall
```

#### 8. 通道绑定

SDK支持通过设备ID、USB以及驱动绑定通道名称。
设备id绑定

![null](https://vip.123pan.cn/1831996731/a_PicBed/hardware/can-card-use/20260628230321881.webp)

USB以及驱动绑定

![null](https://vip.123pan.cn/1831996731/a_PicBed/hardware/can-card-use/20260628230321863.webp)

## b. 基础配置

### i. Windows

暂无

### ii. Linux

参考来源：[socketcan/config.md · 成都鲲弘电子科技有限公司/KH-UCANFD_Linux_SDK - Gitee.com](https://gitee.com/ChengDu-KunHong/KH-UCANFD_Linux_SDK/blob/master/socketcan/config.md#socketcan基础配置)

- **SocketCAN基础配置（核心概念）**
  - CAN 接口：Linux 系统中将 CAN 设备映射为网络接口（如 can0、can1），可通过网络命令管理。
  - 波特率：CAN 总线通信速率，常见值为 250Kbps、500Kbps、1Mbps，需所有节点保持一致。
  - CAN 帧：包含 ID（标识符）、数据段（0-8 字节，CAN FD 支持 0-64 字节）、控制段等，分为标准帧（11 位 ID）和扩展帧（29 位 ID）。

- **安装所需的工具**

  ```bash
  sudo apt install iproute2
  ```

#### 1. 内核支持检查

```bash
# 首先确认内核是否启用SocketCAN模块，可通过 `lsmod`命令查看
# 检查 CAN 核心模块
lsmod | grep can
# 若未加载，手动加载核心模块
sudo modprobe can
sudo modprobe kcan # KH-UCANFD 驱动
```

![null](https://vip.123pan.cn/1831996731/a_PicBed/hardware/can-card-use/20260628230518167.webp)

#### 2. 设备识别

```bash
# 连接 CAN 设备后，通过以下命令确认设备是否被识别
# 查看 USB 设备（USB-CAN 适配器）
lsusb -t | grep -i can

# 查看网络接口（CAN 设备映射为网络接口）
ip link show | grep can

# 查看详细设备信息
dmesg | grep -i can
```

![null](https://vip.123pan.cn/1831996731/a_PicBed/hardware/can-card-use/20260628230518208.webp)

#### 3. 设备配置

```bash
# CAN 设备使用前需配置波特率、工作模式等参数，核心命令如下
# 1. 关闭 CAN 接口（配置前需确保接口未启用）
sudo ip link set can0 down

# 2. 配置参数
# 示例一：配置波特率为1M
sudo ip link set can0 type can bitrate 1000000
# 示例二：配置仲裁段波特率1M，数据段波特率5M，开启 CAN FD 模式
sudo ip link set can0 type can bitrate 1000000 dbitrate 5000000 fd on
# 示例三：配置仲裁段波特率1M采样75%，数据段波特率5M采样点80%，开启 CAN FD 模式
sudo ip link set can0 type can bitrate 1000000 sample-point 0.75 dbitrate 5000000 dsample-point 0.8 fd on

# 3. 启用 CAN 接口
sudo ip link set can0 up

# 4. 验证配置结果
ip -d link show can0
```

![null](https://vip.123pan.cn/1831996731/a_PicBed/hardware/can-card-use/20260628230518192.webp)

#### 4. 接口状态

配置完成后，通过ip和ifconfig命令查看接口状态，获取更详细的设备运行信息。
通过以下命令查看CAN设备的状态、错误计数、数据收发情况等核心信息，是设备调试的重要手段。

```bash
# 方法1：ip命令查看设备详细状态（含波特率、错误状态、驱动等）
ip -d link show

# 方法2：ifconfig命令查看收发统计（含包数量、错误数等）
ifconfig -a
```

- **ip -d link show 输出示例**

  ```bash
  can0: <NOARP,UP,LOWER_UP> mtu 72 qdisc pfifo_fast state UP mode DEFAULT group default qlen 10  # can0 CAN FD 模式 启用状态
      link/can  promiscuity 0 minmtu 0 maxmtu 0 
      can <FD> state ERROR-ACTIVE (berr-counter tx 0 rx 0) restart-ms 0 
            bitrate 1000000 sample-point 0.750 
            tq 12 prop-seg 29 phase-seg1 30 phase-seg2 20 sjw 10
            kcan: tseg1 1..256 tseg2 1..128 sjw 1..128 brp 1..1024 brp-inc 1
            dbitrate 8000000 dsample-point 0.700 
            dtq 12 dprop-seg 3 dphase-seg1 3 dphase-seg2 3 dsjw 1
            kcan: dtseg1 1..32 dtseg2 1..16 dsjw 1..16 dbrp 1..1024 dbrp-inc 1
            clock 80000000 numtxqueues 1 numrxqueues 1 gso_max_size 65536 gso_max_segs 65535 
  can1: <NOARP> mtu 16 qdisc noop state DOWN mode DEFAULT group default qlen 10 # can1 CAN 2.0B 模式 未启用状态
      link/can  promiscuity 0 minmtu 0 maxmtu 0 
      can state STOPPED (berr-counter tx 0 rx 0) restart-ms 0 
            kcan: tseg1 1..256 tseg2 1..128 sjw 1..128 brp 1..1024 brp-inc 1
            kcan: dtseg1 1..32 dtseg2 1..16 dsjw 1..16 dbrp 1..1024 dbrp-inc 1
            clock 80000000 numtxqueues 1 numrxqueues 1 gso_max_size 65536 gso_max_segs 65535
  ```

  - 关键状态解读：
    - **state UP**：接口已启用；state DOWN：接口未启用。
    - **ERROR-ACTIVE**：正常工作状态，错误计数器值较低；STOPPED：接口停止工作；若为BUS-OFF则表示总线关闭，无法通信。
    - **berr-counter tx 0 rx 0**：发送/接收错误计数器为0，值越高说明总线干扰越大，超过阈值会触发错误状态。

- **ifconfig -a 输出示例及解读**

  ```bash
  can0: flags=193<UP,RUNNING,NOARP>  mtu 72
          unspec 00-00-00-00-00-00-00-00-00-00-00-00-00-00-00-00  txqueuelen 10  (UNSPEC)
          RX packets 8423  bytes 67384 (67.3 KB)  # 接收数据包数量及字节数
          RX errors 0  dropped 0  overruns 0  frame 0  # 接收错误、丢包等统计
          TX packets 8407  bytes 67256 (67.2 KB)  # 发送数据包数量及字节数
          TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0  # 发送错误、丢包等统计
  ```

#### 5. 错误处理

当CAN设备进入错误状态时，会直接影响通信，需及时排查处理。通过ip -d link show可快速定位错误类型，其中最常见的为BUS-OFF（总线关闭）状态。

```bash
# BUS-OFF错误状态示例
can <FD> state BUS-OFF (berr-counter tx 248 rx 127) restart-ms 0
```

BUS-OFF状态通常因总线持续存在严重干扰或短路导致，错误计数器达到阈值后设备自动关闭总线。恢复方法如下：

```bash
# 重启CAN设备以恢复正常状态
sudo ip link set can0 down
sudo ip link set can0 up
```

恢复后重新检查总线连接（如终端电阻是否正常、线材是否破损），避免再次触发错误。

## c. 二次开发支持

### i. ScketCAN

以下为 SocketCAN 开发的基础操作模块，点击链接可进入对应子文档查看详细步骤与说明。

#### 1. CAN 设备初始化

- 设备识别：确认 CAN 设备是否正常挂载、获取设备基础信息（如型号、接口名）

- 设备配置：设置波特率、采样点、工作模式等核心参数，保障总线通信匹配

- 📚 详细操作指南：[CAN 配置手册](https://gitee.com/ChengDu-KunHong/KH-UCANFD_Linux_SDK/blob/master/socketcan/config.md)

#### 2. can-utils

- **安装can-utils工具**
  
  ```bash
  sudo apt install can-utils
  ```
  
- **相关资料链接**
  - [【开源分享】can-utils：深入解析 Linux CAN 工具集-CSDN博客](https://blog.csdn.net/allen_spring/article/details/149982099?ops_request_misc=elastic_search_misc&request_id=e35c319c4b1347f1e70e595e36adaee8&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-149982099-null-null.142%5Ev102%5Epc_search_result_base8&utm_term=can-utils&spm=1018.2226.3001.4187)
  - [Linux CAN Utils教程：CAN口数据发送与接收实战指南-CSDN博客](https://blog.csdn.net/proware/article/details/126107886?ops_request_misc=elastic_search_misc&request_id=e35c319c4b1347f1e70e595e36adaee8&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~ElasticSearch~search_v2-6-126107886-null-null.142%5Ev102%5Epc_search_result_base8&utm_term=can-utils)
  - [开源工具can-utils的使用_cangen-CSDN博客](https://blog.csdn.net/wang_anna/article/details/150339998)
  - [📦 工具集完整文档：can-utils 使用指南](https://gitee.com/ChengDu-KunHong/KH-UCANFD_Linux_SDK/blob/master/socketcan/canutils.md)

- **常见工具**
  can-utils 是 SocketCAN 官方配套的命令行工具集，提供了 CAN 通信的快速测试与调试能力
  
  | 工具命令   | 功能描述                                | 常用参数示例                    |
  | ---------- | --------------------------------------- | ------------------------------- |
  | cansend    | 发送单条CAN报文                         | `cansend can0 123#112233445566` |
  | candump    | 监听并记录CAN报文，可输出到屏幕或文件   | `candump -l -t a can0`          |
  | cansniffer | 实时监听CAN报文，按ID分组显示，支持过滤 | `cansniffer -c can0`            |
  | canbusload | 统计CAN总线负载率                       | `canbusload can0@500000`        |

- **常见工具解析**

  - 报文发送：**cansend**

    - | 需求                                       | 错误命令           | 正确命令                       |
      | ------------------------------------------ | ------------------ | ------------------------------ |
      | 标准帧（ID=0x123，数据 = 11223344）        | -                  | cansend can0 123#11223344      |
      | 扩展帧（ID=0x12345678，数据 = 55667888）   | X12345678#55667888 | cansend can0 12345678#55667888 |
      | 远程帧（扩展帧 ID=0x12345678）             | XR12345678#        | cansend can0 12345678#R        |
      | CAN FD 扩展帧（ID=0x12345678，标志位 = 3） | `X12345678##31122` | cansend can0 12345678##31122   |

    用于发送单条 CAN 报文，格式为 cansend <接口名> <报文ID>#<数据段>

    ```bash
    # 发送标准帧：ID=0x123，数据=11223344
    cansend can0 123#11223344
    
    # 发送扩展帧：ID=0x12345678，数据=55667888
    cansend can0 X12345678#55667888
    
    # 发送远程帧（仅请求数据，无数据段，前缀加“R”）
    cansend can0 R123#
    
    # 发送CAN FD帧（需要接口支持）
    cansend can0 123##3112233445566778899AABBCC
    
    # 每100ms发送一次，共发送10次(这个是错误的)
    cansend can0 -l 100 -n 10 123#11223344
    # 可以使用 cangen 循环发送
    # 向 can0 发送 10 帧、ID 为 123、数据为 11223344 的帧，间隔 100ms
    cangen can0 -I 123 -D 11223344 -L 4 -n 10 -g 100
    ```

  - 报文监听：**candump**

    candump实时监听 CAN 总线报文，支持输出到屏幕、保存到文件，核心参数用于过滤 ID、设置时间格式。

    - **基本用法**

      ```bash
      # 监听所有CAN报文
      candump can0
      
      # 监听多个接口
      candump can0 can1
      ```

    - **过滤功能**

      ```bash
      # 只监听特定ID
      candump can0,123:7FF        # 监听ID 0x123
      
      # 监听多个特定ID
      candump can0,123:7FF,456:7FF,789:7FF
      
      # 使用掩码过滤
      candump can0,123:7F0        # 监听ID 0x120-0x12F
      
      # 排除特定ID
      candump can0,~123:7FF       # 监听除0x123外的所有ID
      ```

    - **输出格式控制**

      ```bash
      # 彩色输出
      candump -c can0
      
      # 显示帧类型
      candump -x can0
      
      # 时间格式精细控制
      candump -t a -H can0  
      
      # 可以混合 
      candump -c -x can0 can1 can2 can3
      ```

    - **日志记录**

      ```bash
      # 记录到文件
      candump -l can0 # 记录到candump-YYYYMMDDHHMMSS.log
      
      # 指定日志文件
      candump can0 > can_log.txt
      ```

  - 总线负载监控：**canbusload**

    实时刷新显示 CAN 总线的负载率、帧率。

    - **基本用法**

      ```bash
      # 显示can0和can1在FD模式1M/5M下的负载率、帧数
      canbusload can0@1000000,5000000 can1@1000000,5000000  
      ```

      ![null](https://vip.123pan.cn/1831996731/a_PicBed/hardware/can-card-use/20260628231232643.gif)

    - **高级用法**

      ```bash
      # 打印时间
      canbusload -t can0@1000000,5000000
      # 可视化界面
      canbusload -v can0@1000000,5000000
      ```

      ![null](https://vip.123pan.cn/1831996731/a_PicBed/hardware/can-card-use/20260628231232834.webp)

  - CAN帧生成工具：**cangen**
    
    cangen是用于生成和发送 CAN 帧的强大工具，支持多种帧类型和生成模式。
    
    ```bash
    # 设置帧发送间隔（毫秒）
    cangen -g 100 can0        # 每100ms发送一帧
    
    # 生成扩展帧（29位ID）
    cangen -e can0            # 随机29位ID
    cangen -e -I 12345678 can0 # 固定扩展ID
    
    # 生成CAN FD帧
    cangen -f can0            # 基本CAN FD帧
    # CAN FD带比特率切换
    cangen -f -b can0         # 启用比特率切换(BRS)
    # CAN FD带错误状态指示
    cangen -f -E can0         # 设置错误状态(ESI)
    
    # 向 can0 发送 10 帧、ID 为 123、数据为 11223344 的帧，间隔 100ms
    cangen can0 -I 123 -D 11223344 -L 4 -n 10 -g 100
    ```
    
    ![null](https://vip.123pan.cn/1831996731/a_PicBed/hardware/can-card-use/20260628233320826.gif)
    
  - can帮助
    - `cansend -h`
    - `candump -h`
    - `canbusload -h`
    - `cangen -h`

> [!TIP]
>
> cangen 循环发送不同的数据帧
>
> #### 核心前提
>
> 1. 先激活 CAN 接口（以 can0、500kbps 标称波特率为例，CAN FD 需额外配置数据波特率）：
> 2. `cangen` 是 SocketCAN 自带工具，若未安装需先装：`sudo apt install can-utils`。
>
> ##### 一、循环发送标准帧（ID=0x123，数据 = 11223344）
>
> 对应你原命令：`cansend can0 123#11223344`
>
> 参数说明：
> - `-I 123`：指定 CAN 帧 ID 为 0x123（标准帧，3 位十六进制）；
> - `-D 11223344`：数据段固定为 11223344（4 字节）；
> - `-L 4`：数据长度 4 字节（匹配 11223344 的长度）；
> - `-n 100`：总共发送 100 帧（改为 `-n 0` 则无限循环）；
> - `-g 100`：发送间隔 100ms（单位：毫秒）；
> - `-v`： verbose 模式，打印每帧发送日志（可选）。
>
> ##### 二、循环发送扩展帧（ID=0x12345678，数据 = 55667888）
>
> 对应你原命令：`cansend can0 X12345678#55667888`
>
> 关键新增参数：
>
> - `-e`：启用**扩展帧模式**（ID 为 8 位十六进制，对应 X12345678）；
>
> - `-I 12345678`：扩展帧 ID 为 0x12345678（无需加 X 前缀）。
>
> ##### 三、循环发送远程帧（ID=0x123，无数据）
>
> 对应你原命令：`cansend can0 R123#`
>
> `cangen` 原生不直接支持远程帧循环发送，需结合 `bash 循环 + cansend` 实现（更简单）：
>
> ##### 四、循环发送 CAN FD 帧（ID=0x123，数据 = 112233445566778899AABBCC）
>
> 对应你原命令：`cansend can0 123##3112233445566778899AABBCC`
>
> 关键新增参数：
>
> - `-fd`：启用 CAN FD 模式（需先激活接口的 FD 功能）；
> - `-B 3`：CAN FD 标志位（对应 `##3`，3=0b11，启用 FD + 比特率切换）；
> - `-L 12`：CAN FD 数据长度 12 字节（匹配你给出的 112233445566778899AABBCC 长度）；
>
> - 注：CAN FD 最大支持 64 字节数据，需确保 `-L` 与 `-D` 的数据长度一致。
>
> ##### 五、常用扩展用法
>
> 1. **无限循环发送**：将 `-n 数字` 改为 `-n 0`（如 `cangen can0 -I 123 -D 11223344 -L 4 -n 0 -g 100`）；
> 2. **随机数据发送**：去掉 `-D 固定数据`，`cangen` 会自动生成随机数据（如 `cangen can0 -I 123 -L 4 -n 100 -g 100`）；
> 3. **后台持续发送**：命令末尾加 `&`，如 `cangen can0 -I 123 -L 4 -n 0 -g 100 &`（关闭用 `kill %1`）。
>
> ##### 总结
>
> 1. `cangen` 循环发送核心参数：`-I`（ID）、`-D`（固定数据）、`-L`（数据长度）、`-n`（帧数）、`-g`（间隔）；
> 2. 扩展帧加 `-e`，CAN FD 帧加 `-fd -B 标志位`，远程帧优先用 `bash 循环 + cansend`；
> 3. 发送前必须激活 CAN 接口，CAN FD 需额外配置 `dbitrate` 和 `fd on`。
>
> 可根据测试需求调整 `-n`（帧数）、`-g`（间隔）、`-L`（数据长度）等参数，用 `candump can0` 实时监听验证发送结果.

#### 3. can-utils 示例

```bash
# 标准 CAN 2.0 接口激活（仅标称波特率）
sudo ip link set can0 type can bitrate 500000
# CAN FD 接口激活（需同时配置标称+数据波特率）
sudo ip link set can0 type can bitrate 500000 dbitrate 4000000 fd on
# 最终激活接口
sudo ip link set up can0
#------------------------------------------------------------------------------------
# 循环发送 100 帧、间隔 100ms、ID=0x123、数据=11223344 的标准帧
cangen can0 -I 123 -D 11223344 -L 4 -n 100 -g 100 -v
#------------------------------------------------------------------------------------
# 循环发送 50 帧、间隔 200ms、ID=0x12345678 的扩展帧
cangen can0 -I 12345678 -e -D 55667888 -L 4 -n 50 -g 200 -v
#------------------------------------------------------------------------------------
# 循环发送 20 次远程帧，间隔 500ms
for i in {1..20}; do
  cansend can0 R123#
  sleep 0.5
done
#------------------------------------------------------------------------------------
# 循环发送 80 帧、间隔 150ms 的 CAN FD 帧
cangen can0 -I 123 -D 112233445566778899AABBCC -L 12 -n 80 -g 150 -fd -B 3 -v
```

一个demo

```shell
#!/bin/bash
# CAN口+电机全功能配置脚本（can0~can5）
# 核心功能：CAN口初始化/关闭 + 电机启动/使能/运行模式/失能（全扩展帧+单次发送）
# 波特率：1000000（1M）| 经典CAN模式 | 支持can0~can3多口组合选择
# 电机映射规则：can0(1-3)、can1(4-6)、can2(7-9)、can3(A-C) | 每口3个电机
# 所有协议严格匹配：扩展帧ID+固定8位数据+对应前缀
# 发送规则：单次发送（每个电机仅发1次）| 可视化结果（成功/失败）

# 全局基础配置
BITRATE="1000000"  # CAN口波特率1M
CAN_PORTS=("can0" "can1" "can2" "can3" "can4" "can5") # 所有CAN口
DEFAULT_FUNC=1     # 主菜单默认选项：初始化并打开CAN口
# 颜色输出（可视化区分状态）
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # 恢复默认颜色

# 电机四大功能固定协议配置
## 电机启动：0C前缀 + 0570000000000000
MOTOR_START_BASE_ID="0C00000"
MOTOR_START_DATA="0570000000000000"
## 电机使能：03前缀 + 0000000000000000
MOTOR_ENABLE_BASE_ID="0300000"
MOTOR_ENABLE_DATA="0000000000000000"
## 电机运行模式：017FFF前缀 + 7FFFFF7F0A3C6666
MOTOR_MODE_BASE_ID="017FFF0"
MOTOR_MODE_DATA="7FFF7FFF0A3C6666"
## 电机失能：04前缀 + 0000000000000000
MOTOR_DISABLE_BASE_ID="0400000"
MOTOR_DISABLE_DATA="0000000000000000"

# 检查root权限（CAN配置/电机指令发送必须root）
check_root() {
    if [ $EUID -ne 0 ]; then
        echo -e "${RED}❌ 错误：必须以root权限运行！请执行 sudo ./can_multi_config.sh${NC}"
        exit 1
    fi
}

# 加载CAN核心驱动（兜底确保设备识别）
load_can_drivers() {
    echo -e "${YELLOW}🔧 正在加载CAN/RAW/kcan核心驱动...${NC}"
    modprobe can can_raw kcan 2>/dev/null
    modprobe can_fd 2>/dev/null # 兼容FD驱动，不影响经典CAN
    echo -e "${GREEN}✅ 驱动加载完成！${NC}"
    echo "-----------------------------------------"
}

# 功能1：初始化并打开CAN口（支持can0~can5多口组合，如0 2 3）
init_can_ports() {
    echo -e "${BLUE}===== 功能1：初始化并打开CAN口（can0~can5）=====${NC}"
    echo -e "${YELLOW}提示：请输入需要打开的CAN口号（0-5，多口用空格分隔，如0 2 3）：${NC}"
    read -p "请输入CAN口号：" INPUT_PORTS
    # 严格校验输入：仅0-5数字，多口空格分隔
    if ! echo "$INPUT_PORTS" | grep -qE '^[0-5]( [0-5])*$'; then
        echo -e "${RED}❌ 输入无效！仅允许输入0-5的数字，多口用空格分隔${NC}"
        return 1
    fi
    # 循环配置每个CAN口：down→配置1M波特率→up
    for PORT_NUM in $INPUT_PORTS; do
        TARGET_CAN=${CAN_PORTS[$PORT_NUM]}
        echo -e "\n📌 正在处理：$TARGET_CAN"
        ip link set $TARGET_CAN down 2>/dev/null
        echo "  1. 已关闭$TARGET_CAN（确保初始状态）"
        if ip link set $TARGET_CAN type can bitrate $BITRATE; then
            echo "  2. 配置完成：波特率${BITRATE}（1M）"
        else
            echo -e "${RED}  2. ❌ $TARGET_CAN参数配置失败！${NC}"
            continue
        fi
        if ip link set $TARGET_CAN up; then
            echo -e "  3. ${GREEN}✅ 成功启用$TARGET_CAN${NC}"
        else
            echo -e "${RED}  3. ❌ $TARGET_CAN启用失败（参数无效/设备未识别）${NC}"
            continue
        fi
    done
    echo -e "\n${GREEN}✅ 多口初始化完成！可执行 candump -x 口1 口2 测试通信${NC}"
    echo "-----------------------------------------"
}

# 功能2：关闭CAN口（支持can0~can5多口组合，如1 4 5）
close_can_ports() {
    echo -e "${BLUE}===== 功能2：关闭CAN口（can0~can5）=====${NC}"
    echo -e "${YELLOW}提示：请输入需要关闭的CAN口号（0-5，多口用空格分隔，如1 4 5）：${NC}"
    read -p "请输入CAN口号：" INPUT_PORTS
    # 严格校验输入
    if ! echo "$INPUT_PORTS" | grep -qE '^[0-5]( [0-5])*$'; then
        echo -e "${RED}❌ 输入无效！仅允许输入0-5的数字，多口用空格分隔${NC}"
        return 1
    fi
    # 循环关闭每个CAN口
    for PORT_NUM in $INPUT_PORTS; do
        TARGET_CAN=${CAN_PORTS[$PORT_NUM]}
        echo -n "📌 处理$TARGET_CAN："
        if ip link set $TARGET_CAN down 2>/dev/null; then
            echo -e "${GREEN}✅ 成功关闭${NC}"
        else
            echo -e "${RED}❌ 关闭失败（接口未识别/已关闭）${NC}"
        fi
    done
    echo "-----------------------------------------"
}

# 通用电机指令发送函数（抽离公共逻辑，避免重复代码，所有电机功能复用）
# 参数1：功能名称  参数2：ID基础前缀  参数3：固定8位数据
send_motor_cmd() {
    local FUNC_NAME=$1
    local BASE_ID=$2
    local FIX_DATA=$3
    echo -e "${PURPLE}===== $FUNC_NAME（扩展帧+单次发送）=====${NC}"
    echo -e "${YELLOW}📌 电机映射规则（每口3个电机）：${NC}"
    echo -e "  can0 → 电机1-3 | ID：${BASE_ID}1 ~ ${BASE_ID}3"
    echo -e "  can1 → 电机4-6 | ID：${BASE_ID}4 ~ ${BASE_ID}6"
    echo -e "  can2 → 电机7-9 | ID：${BASE_ID}7 ~ ${BASE_ID}9"
    echo -e "  can3 → 电机A-C | ID：${BASE_ID}A ~ ${BASE_ID}C"
    echo -e "${YELLOW}📌 固定配置：扩展帧 | 8位数据：${FIX_DATA}${NC}"
    echo -e "${YELLOW}提示：请输入需要发送的CAN口号（0-3，多口用空格分隔，如0 2）：${NC}"
    read -p "请输入CAN口号：" INPUT_PORTS

    # 校验输入：仅允许0-3（仅can0~can3接电机）
    if ! echo "$INPUT_PORTS" | grep -qE '^[0-3]( [0-3])*$'; then
        echo -e "${RED}❌ 输入无效！仅允许输入0-3的数字，多口用空格分隔${NC}"
        return 1
    fi

    # 循环处理每个选择的CAN口，发送对应3个电机的指令
    for PORT_NUM in $INPUT_PORTS; do
        local TARGET_CAN=${CAN_PORTS[$PORT_NUM]}
        local MOTOR_START_NUM=$(( PORT_NUM * 3 + 1 )) # 计算电机起始编号（can0=1, can1=4...）
        # 循环发送当前CAN口的3个电机指令
        for ((i=0; i<3; i++)); do
            local CURRENT_MOTOR_NUM=$(( MOTOR_START_NUM + i ))
            local CURRENT_MOTOR_ID="${BASE_ID}$(printf '%X' $CURRENT_MOTOR_NUM)" # 转十六进制（A-C自动大写）
            local SEND_CMD="cansend $TARGET_CAN $CURRENT_MOTOR_ID#$FIX_DATA"    # 核心发送命令（严格按你的格式）
            echo -n "📤 发送$TARGET_CAN-电机$CURRENT_MOTOR_NUM（ID：$CURRENT_MOTOR_ID）："
            # 执行发送并判断结果
            if eval $SEND_CMD 2>/dev/null; then
                echo -e "${GREEN}✅ 成功${NC}"
            else
                echo -e "${RED}❌ 失败（接口未启用/设备异常/无回值）${NC}"
            fi
        done
        echo -e "${CYAN}👉 $TARGET_CAN 3个电机$FUNC_NAME指令发送完成！${NC}"
    done
    echo -e "\n${GREEN}✅ 所有选择的CAN口$FUNC_NAME完成！${NC}"
    echo "-----------------------------------------"
}


# 电机运行模式指令发送函数
# 参数1：功能名称  参数2：ID基础前缀  参数3：数据-根据ID而定
send_motor_mode_cmd() {
    local FUNC_NAME=$1
    local BASE_ID=$2
    local FIX_DATA=$3
    echo -e "${PURPLE}===== $FUNC_NAME（扩展帧+单次发送）=====${NC}"
    echo -e "${YELLOW}📌 电机映射规则（每口3个电机）：${NC}"
    echo -e "  can0 → 电机1-3 | ID：${BASE_ID}1 ~ ${BASE_ID}3"
    echo -e "  can1 → 电机4-6 | ID：${BASE_ID}4 ~ ${BASE_ID}6"
    echo -e "  can2 → 电机7-9 | ID：${BASE_ID}7 ~ ${BASE_ID}9"
    echo -e "  can3 → 电机A-C | ID：${BASE_ID}A ~ ${BASE_ID}C"
    echo -e "${YELLOW}📌 固定配置：扩展帧 | 8位数据：${FIX_DATA}${NC}"
    echo -e "${YELLOW}提示：请输入需要发送的CAN口号（0-3，多口用空格分隔，如0 2）：${NC}"
    read -p "请输入CAN口号：" INPUT_PORTS

    # 校验输入：仅允许0-3（仅can0~can3接电机）
    if ! echo "$INPUT_PORTS" | grep -qE '^[0-3]( [0-3])*$'; then
        echo -e "${RED}❌ 输入无效！仅允许输入0-3的数字，多口用空格分隔${NC}"
        return 1
    fi

    # 循环处理每个选择的CAN口，发送对应3个电机的指令
    for PORT_NUM in $INPUT_PORTS; do
        local TARGET_CAN=${CAN_PORTS[$PORT_NUM]}
        local MOTOR_START_NUM=$(( PORT_NUM * 3 + 1 )) # 计算电机起始编号（can0=1, can1=4...）
        # 循环发送当前CAN口的3个电机指令
        for ((i=0; i<3; i++)); do
      
            local CURRENT_MOTOR_NUM=$(( MOTOR_START_NUM + i ))
            local CURRENT_MOTOR_ID="${BASE_ID}$(printf '%X' $CURRENT_MOTOR_NUM)" # 转十六进制（A-C自动大写）
          
            case $CURRENT_MOTOR_NUM in
            1)
                local SEND_CMD="cansend $TARGET_CAN $CURRENT_MOTOR_ID#7FFF7FFF0A3C6666" 
                echo -n "📤 发送$TARGET_CAN-电机$CURRENT_MOTOR_NUM（ID：$CURRENT_MOTOR_ID）："
                ;;
            2)
                local SEND_CMD="cansend $TARGET_CAN $CURRENT_MOTOR_ID#83B17FFF0A3C6666" 
                echo -n "📤 发送$TARGET_CAN-电机$CURRENT_MOTOR_NUM（ID：$CURRENT_MOTOR_ID）："
                ;;   
            3)
                local SEND_CMD="cansend $TARGET_CAN $CURRENT_MOTOR_ID#78177FFF0A3C6666" 
                echo -n "📤 发送$TARGET_CAN-电机$CURRENT_MOTOR_NUM（ID：$CURRENT_MOTOR_ID）："
                ;;
            4)
                local SEND_CMD="cansend $TARGET_CAN $CURRENT_MOTOR_ID#7DB77FFF0A3C6666" 
                echo -n "📤 发送$TARGET_CAN-电机$CURRENT_MOTOR_NUM（ID：$CURRENT_MOTOR_ID）："
                ;;
            5)
                local SEND_CMD="cansend $TARGET_CAN $CURRENT_MOTOR_ID#702E7FFF0A3C6666" 
                echo -n "📤 发送$TARGET_CAN-电机$CURRENT_MOTOR_NUM（ID：$CURRENT_MOTOR_ID）："
                ;;   
            6)
                local SEND_CMD="cansend $TARGET_CAN $CURRENT_MOTOR_ID#7FFF7FFF0A3C6666" 
                echo -n "📤 发送$TARGET_CAN-电机$CURRENT_MOTOR_NUM（ID：$CURRENT_MOTOR_ID）："
                ;;
            7)
                local SEND_CMD="cansend $TARGET_CAN $CURRENT_MOTOR_ID#7FFF7FFF0A3C6666" 
                echo -n "📤 发送$TARGET_CAN-电机$CURRENT_MOTOR_NUM（ID：$CURRENT_MOTOR_ID）："
                ;;
            8)
                local SEND_CMD="cansend $TARGET_CAN $CURRENT_MOTOR_ID#7FFF7FFF0A3C6666" 
                echo -n "📤 发送$TARGET_CAN-电机$CURRENT_MOTOR_NUM（ID：$CURRENT_MOTOR_ID）："
                ;;   
            9)
                local SEND_CMD="cansend $TARGET_CAN $CURRENT_MOTOR_ID#85467FFF0A3C6666" 
                echo -n "📤 发送$TARGET_CAN-电机$CURRENT_MOTOR_NUM（ID：$CURRENT_MOTOR_ID）："
                ;;
            10)
                local SEND_CMD="cansend $TARGET_CAN $CURRENT_MOTOR_ID#82D07FFF0A3C6666" 
                echo -n "📤 发送$TARGET_CAN-电机$CURRENT_MOTOR_NUM（ID：$CURRENT_MOTOR_ID）："
                ;;
            11)
                local SEND_CMD="cansend $TARGET_CAN $CURRENT_MOTOR_ID#7B6E7FFF0A3C6666" 
                echo -n "📤 发送$TARGET_CAN-电机$CURRENT_MOTOR_NUM（ID：$CURRENT_MOTOR_ID）："
                ;;   
            12)
                local SEND_CMD="cansend $TARGET_CAN $CURRENT_MOTOR_ID#84927FFF0A3C6666" 
                echo -n "📤 发送$TARGET_CAN-电机$CURRENT_MOTOR_NUM（ID：$CURRENT_MOTOR_ID）："
                ;;
              
            *)
                ;;
            esac

          
          
            # 执行发送并判断结果
            if eval $SEND_CMD 2>/dev/null; then
                echo -e "${GREEN}✅ 成功${NC}"
            else
                echo -e "${RED}❌ 失败（接口未启用/设备异常/无回值）${NC}"
            fi
        done
        echo -e "${CYAN}👉 $TARGET_CAN 3个电机$FUNC_NAME指令发送完成！${NC}"
    done
    echo -e "\n${GREEN}✅ 所有选择的CAN口$FUNC_NAME完成！${NC}"
    echo "-----------------------------------------"
}


# 功能3：电机启动配置（调用通用函数，传启动协议参数）
motor_start_config() {
    send_motor_cmd "功能3：电机启动配置" "$MOTOR_START_BASE_ID" "$MOTOR_START_DATA"
}

# 功能4：电机使能配置（调用通用函数，传使能协议参数）
motor_enable_config() {
    send_motor_cmd "功能4：电机使能配置" "$MOTOR_ENABLE_BASE_ID" "$MOTOR_ENABLE_DATA"
}

# 功能5：电机运行模式配置（调用通用函数，传运模协议参数）
motor_mode_config() {
    send_motor_mode_cmd "功能5：电机运行模式配置" "$MOTOR_MODE_BASE_ID" "$MOTOR_MODE_DATA"
}

# 功能6：电机失能配置（调用通用函数，传失能协议参数）
motor_disable_config() {
    send_motor_cmd "功能6：电机失能配置" "$MOTOR_DISABLE_BASE_ID" "$MOTOR_DISABLE_DATA"
}

# 主菜单（带默认选项，执行完功能自动返回）
show_menu() {
    clear
    echo -e "${GREEN}=============================================${NC}"
    echo -e "${GREEN}          CAN口+电机全功能配置脚本            ${NC}"
    echo -e "${GREEN}          波特率：${BITRATE}（1M）| CAN0~CAN5          ${NC}"
    echo -e "${PURPLE}          所有电机指令：扩展帧 | 单次发送       ${NC}"
    echo -e "${GREEN}=============================================${NC}"
    echo -e "${YELLOW}请选择功能（直接回车默认选择${DEFAULT_FUNC}）：${NC}"
    echo " 1) 初始化并打开CAN口"
    echo " 2) 关闭CAN口"
    echo " 3) 电机配置"
    echo " 4) 电机使能"
    echo " 5) 电机运模"
    echo " 6) 电机失能"
    echo " 0) 退出脚本"
    echo -e "${GREEN}=============================================${NC}"
    read -p "请输入选项[0-6]：" USER_CHOICE
    # 直接回车使用默认选项（初始化开CAN口）
    if [ -z "$USER_CHOICE" ]; then
        USER_CHOICE=$DEFAULT_FUNC
    fi
    # 执行对应功能
    case $USER_CHOICE in
        1) init_can_ports ;;
        2) close_can_ports ;;
        3) motor_start_config ;;
        4) motor_enable_config ;;
        5) motor_mode_config ;;
        6) motor_disable_config ;;
        0) echo -e "${YELLOW}📤 脚本正常退出...${NC}"; exit 0 ;;
        *) echo -e "${RED}❌ 输入无效！仅允许输入0-6的数字${NC}"; sleep 2; show_menu ;;
    esac
    # 执行完功能后，按任意键返回主菜单（支持连续操作）
    read -p "按任意键返回主菜单..." -n1 -s
    show_menu
}

# 主执行流程
main() {
    check_root          # 强制检查root权限，无则退出
    load_can_drivers    # 加载CAN驱动，仅首次运行执行
    show_menu           # 显示主菜单，进入交互流程
}

# 启动脚本
main
```

#### 4. SocketCAN编程

SocketCAN 核心优势在于支持标准 Socket 编程接口，开发者可基于此快速实现 CAN 报文的收发、过滤与异常处理。编程模块将涵盖以下核心内容：

- SocketCAN 套接字创建与初始化（AF_CAN 协议族配置）
- CAN 报文结构解析（标准帧/扩展帧、数据段、ID 等）
- 绑定（bind）、发送（sendto）、接收（recvfrom）核心接口使用
- 报文过滤规则配置与中断处理
- CAN FD 高带宽通信编程实现

💻 编程实践教程：[SocketCAN 编程开发指南](https://gitee.com/ChengDu-KunHong/KH-UCANFD_Linux_SDK/blob/master/socketcan/program.md)

### ii. python-CAN

python-CAN 是一个跨平台的 Python 库，提供了简洁的 CAN 通信接口。KH-UCANFD_Linux SDK 完全兼容 python-can，开发者可以使用 Python 快速开发 CAN FD 应用程序。

📚 python-CAN 开发指南（已失效）：[python-CAN 使用教程](https://gitee.com/ChengDu-KunHong/KH-UCANFD_Linux_SDK/blob/master/python-can/README.md)

- 官方链接
  - https://python-can.readthedocs.io/en/stable/interfaces/socketcand.html
  - https://python-can.readthedocs.io/en/stable/interfaces/socketcan.html
- 找的学习链接：
  - [Python之python-can-CSDN博客](https://blog.csdn.net/plutozuo/article/details/133637707?ops_request_misc=elastic_search_misc&request_id=c3ced475357d98fc8e3ae176f3e6a23a&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-133637707-null-null.142^v102^pc_search_result_base8&utm_term=python-can&spm=1018.2226.3001.4187)
  - [【Python】python-can使用记录-CSDN博客](https://blog.csdn.net/qq_44781620/article/details/154958450?ops_request_misc=elastic_search_misc&request_id=c3ced475357d98fc8e3ae176f3e6a23a&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-154958450-null-null.142^v102^pc_search_result_base8&utm_term=python-can&spm=1018.2226.3001.4187)
  - [Python can库_python-can-CSDN博客](https://blog.csdn.net/molangmolang/article/details/140389153?ops_request_misc=&request_id=&biz_id=102&utm_term=python-can&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-1-140389153.142^v102^pc_search_result_base8&spm=1018.2226.3001.4187)

## d. Python 控制

### i. 安装 python-can

**安装依赖**：使用 `python-can` 库（Python 操作 CAN 总线的主流库，支持 `cansend` 同款的 SocketCAN 底层驱动）

```bash
# 第一种方式 系统安装
# 1. 更新系统软件源
sudo apt update
# 2. 重新安装全新的python3-pip
sudo apt install -y python3-pip
# 3. 升级pip3到最新版
sudo pip3 install --upgrade pip -i https://pypi.tuna.tsinghua.edu.cn/simple --trusted-host pypi.tuna.tsinghua.edu.cn
# 4. 安装 python-can
sudo pip3 install python-can -i https://pypi.tuna.tsinghua.edu.cn/simple --trusted-host pypi.tuna.tsinghua.edu.cn

# 第二种方式 虚拟环境安装

pip install python-can

# 1. 临时启用 conda
eval "$(~/miniforge3/bin/conda shell.bash hook)"

# 2. 创建一个新的python环境
# 创建一个名为 cq_arm 的 python3.8环境
conda create -n cq_arm python=3.8
# 进入环境
conda activate cq_arm

# 3. 设置别名
echo "alias cq_arm='eval \"\$(~/miniforge3/bin/conda shell.bash hook)\" && conda activate cq_arm'" >> ~/.bashrc
echo "alias cq_arm-e='while [ -n \"\$CONDA_DEFAULT_ENV\" ]; do conda deactivate; done && cd ~'" >> ~/.bashrc
source ~/.bashrc
```

### ii. 基础应用

#### 1. 系统 CAN 口初始化（Linux 终端执行）

运行 Python 代码前，需先在终端配置并启动 CAN 口（以 can0、500k 波特率为例）：

```bash
# 加载CAN内核模块（首次执行，后续无需重复）
sudo modprobe can can_raw
# 配置CAN口波特率并启动
sudo ip link set can0 type can bitrate 500000
sudo ip link set can0 up
# 验证CAN口状态（显示UP即成功）
ip link show can0
```

#### 2. 简单应用代码

该示例实现：**初始化 CAN 总线** → **发送 1 帧标准 CAN 数据** → **循环接收 CAN 帧并打印**，包含基础异常处理。

```python
import can
import time

def simple_can_communication(can_port="can0", bitrate=500000):
    """
    Python-CAN简单通信：初始化总线 + 发送1帧 + 循环接收
    :param can_port: CAN口名称（如can0/can1）
    :param bitrate: 波特率（如125000/250000/500000/1000000）
    """
    bus = None
    try:
        # 1. 初始化CAN总线对象（SocketCAN接口，核心步骤）
        print(f"正在初始化 {can_port} 总线，波特率：{bitrate/1000}k...")
        bus = can.interface.Bus(
            channel=can_port,       # CAN口通道
            interface="socketcan",  # 固定为socketcan（Linux系统）
            bitrate=bitrate,        # 波特率与终端配置一致
            receive_own_messages=False  # 不接收自身发送的帧，避免干扰
        )
        print(f"✅ {can_port} 总线初始化成功！")

        # 2. 构造并发送1帧标准CAN数据（11位ID，8字节数据，CAN基础帧）
        print("\n开始发送CAN帧...")
        send_msg = can.Message(
            arbitration_id=0x123,    # 标准帧ID（11位，范围0~0x7FF）
            data=[0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08],  # 8字节数据（CAN协议标准）
            is_extended_id=False     # False=标准帧，True=扩展帧（29位ID）
        )
        bus.send(send_msg)  # 发送帧
        print(f"📤 发送成功 | ID:0x{send_msg.arbitration_id:X} | 数据:{[hex(x) for x in send_msg.data]}")

        # 3. 循环接收CAN帧，实时打印（阻塞式接收，超时时长1秒）
        print("\n开始循环接收CAN帧（按Ctrl+C退出）...")
        print("格式：[时间] 口名 | ID | 帧类型 | 数据")
        while True:
            # recv(timeout)：阻塞接收，timeout=None为永久阻塞，0为非阻塞
            recv_msg = bus.recv(timeout=1.0)
            if recv_msg:  # 接收到有效帧
                frame_type = "扩展帧" if recv_msg.is_extended_id else "标准帧"
                current_time = time.strftime("%H:%M:%S", time.localtime())
                print(
                    f"[{current_time}] {can_port} | 0x{recv_msg.arbitration_id:X} | "
                    f"{frame_type} | {[hex(x) for x in recv_msg.data]}"
                )

    except can.CanError as e:
        # CAN通信异常（如总线关闭、发送失败）
        print(f"\n❌ CAN通信错误：{e}")
    except KeyboardInterrupt:
        # 捕获Ctrl+C，优雅退出
        print(f"\n\n👋 接收到退出指令，程序终止")
    finally:
        # 最终清理：关闭总线（释放资源）
        if bus:
            bus.shutdown()
            print(f"\n✅ {can_port} 总线已关闭，资源释放完成")

# 程序入口
if __name__ == "__main__":
    # 调用函数，使用can0、500k波特率（与终端配置一致）
    simple_can_communication(can_port="can0", bitrate=500000)
```

#### 3. 核心功能说明

- **总线初始化核心参数**

  - `channel`：CAN 口名称，需与终端配置的一致（如 can0、can1）；

  - `interface="socketcan"`：Linux 系统专属接口，无需额外驱动；

  - `bitrate`：波特率必须**与终端** `ip link set`**配置的完全一致**，否则通信失败；

  - `receive_own_messages=False`：避免接收到自己发送的 CAN 帧，防止数据干扰。


- **CAN 帧构造规则**

  - 标准帧（11 位 ID）：`is_extended_id=False`，ID 范围 `0 ~ 0x7FF`；

  - 扩展帧（29 位 ID）：`is_extended_id=True`，ID 范围 `0 ~ 0x1FFFFFFF`；

  - 数据域：必须是**0~0xFF 的整数列表**，CAN 协议标准为 8 字节，超出会自动截断，不足可补 0（如 `[0x01,0x02]`）。


- **收发核心方法**

  - 发送：`bus.send(can.Message对象)`，抛出 `can.CanError`代表发送失败；

  - 接收：`bus.recv(timeout=超时时间)`，超时返回 `None`，成功返回 `can.Message`对象。


#### 4. 运行步骤

1. 打开**第一个 Linux 终端**，执行**前置准备 2**的 CAN 口初始化命令，启动 can0；
2. 打开第二个 Linux 终端，运行该 Python 代码（无需 sudo，因终端已完成 CAN 口配置）：

   ```bash
   python can_simple_demo.py
   ```
3. （可选）打开第三个 Linux 终端，用 `cansend`命令发送测试帧，验证接收功能：

   ```bash
   # 发送标准帧：ID=0x456，数据=0x0a 0x0b 0x0c
   cansend can0 456#0A0B0C0000000000
   # 发送扩展帧：ID=0x123456，数据=0x01 0x02
   cansend can0 123456#0102000000000000
   ```

#### 5. 运行效果示例

```latex
正在初始化 can0 总线，波特率：500.0k...
✅ can0 总线初始化成功！

开始发送CAN帧...
📤 发送成功 | ID:0x123 | 数据:['0x1', '0x2', '0x3', '0x4', '0x5', '0x6', '0x7', '0x8']

开始循环接收CAN帧（按Ctrl+C退出）...
格式：[时间] 口名 | ID | 帧类型 | 数据
[15:30:25] can0 | 0x456 | 标准帧 | ['0xa', '0xb', '0xc', '0x0', '0x0', '0x0', '0x0', '0x0']
[15:30:30] can0 | 0x123456 | 扩展帧 | ['0x1', '0x2', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0']

👋 接收到退出指令，程序终止

✅ can0 总线已关闭，资源释放完成
```

#### 6. 常用扩展修改

1. **发送扩展帧**：只需修改帧构造的 `is_extended_id=True`，并设置 29 位 ID（如 `0x123456`）；
2. **非阻塞接收**：将 `bus.recv(timeout=1.0)`改为 `bus.recv(timeout=0)`，适合嵌入主循环不阻塞其他逻辑；
3. **发送自定义数据**：修改 `data`参数为任意 0~0xFF 的整数列表，如 `[0x00, 0xFF, 0x88]`（自动补 8 字节）；
4. **切换 CAN 口 / 波特率**：修改 `simple_can_communication`的入参，如 `simple_can_communication("can1", 1000000)`（需先在终端配置 can1）。

#### 7. 常见问题排查

1. **总线初始化失败**：检查 CAN 口是否已用 `ip link set`启动、波特率是否一致、接口是否为 `socketcan`；
2. **接收不到数据**：确认发送方与接收方的 CAN 口波特率一致、物理接线正常、`receive_own_messages`是否为 `False`；
3. **发送失败**：检查 CAN 总线是否存在错误（如总线关闭），可执行 `sudo ip link set can0 down && sudo ip link set can0 up`重启 CAN 口。

---


# 2. USB_CANHUB

- **灵足时代赠送的CAN卡资料**
  - [USB_CANHUB使用说明V1.0.pdf](https://1831996731.share.123pan.cn/123pan/wdzVjv-7Apyv)



---

# 3. KAS-ROBOT-CANFDx6

- **酷安晟 6 通道 CAN**
  - [ROBOT_CANFD产品说明书.pdf](https://1831996731.share.123pan.cn/123pan/wdzVjv-Asryv)



---
