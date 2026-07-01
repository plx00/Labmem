---
title: 华大科技-桌面模组
published: 2024-01-05
updated: 2026-07-01
description: 华大科技-桌面模组平台搭建
image: /assets/bolg_cover/huada-desktop-module.webp
tags: [Jetson, 镜像, 人工智能]
category: 项目
draft: false
author: larry
password: ""
passwordHint: ""
---

---

# 前言

>这个也好久了

>记录一下系统的构建与相应修改的地方，方便后面操作，并且防止系统崩溃。

使用的的材料大概就是1个U盘、1个电脑、**Jetson Xavier NX**套件（搭配硬盘、网卡），剩下的就是电源、数据线、跳线帽之类的了。

流程是**搭建一个Linux环境** -> **烧录系统镜像** -> **更换开机动画** -> **在固态盘的镜像烧录**。

# 1. 平台搭建

~~这个的系统构建应该哪个版本的Linux 都可以应该~~，但是华大那边说是使用的 `Ubuntu 18.04`版本（只能用这个版本）

## a. 制作启动盘

- **镜像下载**
  - 推荐网址：[纯净镜像站](https://msdn.itellyou.cn/ )
  - 官方网址：[Ubuntu Releases](https://releases.ubuntu.com/)
- **烧录软件**
  - [windows上使用的 Rufus](https://github.com/pbatard/rufus)

    ![1774879025797-59ffd16d-620f-4831-b819-fcdd2513a3e1](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701143823558.webp)

## b. 安装

**大概步骤就是将镜像写入到U盘中，再通过电脑的UEFI启动进行系统的安装。**

- 具体实施参考（写的很详细）
  - [UBUNTU18.04安装教程_ubuntu1804安装-CSDN博客](https://blog.csdn.net/QQ_2816286940/article/details/114681106?spm=1001.2101.3001.6661.1&utm_medium=distribute.pc_relevant_t0.none-task-blog-2~default~BlogCommendFromBaidu~PaidSort-1-114681106-blog-126079487.235^v43^pc_blog_bottom_relevance_base9&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-2~default~BlogCommendFromBaidu~PaidSort-1-114681106-blog-126079487.235^v43^pc_blog_bottom_relevance_base9&utm_relevant_index=1)

- 相对应的pdf文件（防失效）
  - [Ubuntu18.04系统安装.pdf](https://1831996731.share.123pan.cn/123pan/wdzVjv-iqTVv) 

# 2. 系统烧录

有了烧录平台后，就可以进行`Jetson Xavier NX`系统的烧录了。

## a. 下载 SDKManager

- **官方网址**
  - [SDK Manager | NVIDIA Developer](https://developer.nvidia.com/sdk-manager)
  - 如果链接失效的话，百度直接搜索**SDKManager**，也可以找得到。
- **安装**
  - **双击安装 **或者 **sudo dpkg -i 安装包地址**
- **问题**
  - 可能会出现依赖问题比如说**libcanberra-gtk-module**包缺失，可以输入命令`sudo apt --fix-broken install`来解决依赖缺失问题。

## b. 注册 NVIDIA 账号

进入软件需要账号，使用邮箱注册一个就可以登陆进去，最后登陆软件成功的画面。

![image-20260701144731895](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701144732197.webp)

## c. 硬件连接

1. **用短接线短接 FC REC和GND引脚**
2. **连上显示屏**
3. **数据线连接**
4. **最后插上 19V DC口 电源**

[grid]
![image-20260701144943644](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701144943852.webp)
![image-20260701144954985](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701144955272.webp)
![image-20260701145007934](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701145008212.webp)
[/grid]

## d. 烧录

### i. 流程

- **第一步**

  需要注意的是 **SDK Version** 版本需要选择 **JetPack4.6.5** ，但是最开始使用的是 `4.6.4`版本，可能后面不支持了，但是华大科技那边，最开始是使用的4.6.4版本，4.6.5版本测试是没有问题的，所以也正常使用。

  ![image-20260701145544215](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701145544452.webp)
- **第二步**
  - 去除勾选 **Jetson SDK Components**
  - 勾选  **I accept the terms and conditions of the ...**
  - 点击 **CONTINUE TO STEP 03**

  ![image-20260701145819477](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701145819718.webp)
- **第三步**
  - **输入管理员密码(电脑的开机密码)**

    **第一次执行可能需要一段时间来下载JetPac等配置文件,等待下载完成即可。**

    ![image-20260701145919694](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701145919815.webp)
  - 输入烧录镜像的**用户名与密码**(华大科技的)
    - 用户名：**hdkj**
    - 密码：**hdkj**
    - 这里注意 **2. Storage Device:** 需要选择默认项 **EMMC (default)**

    ![image-20260701150146301](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701150146564.webp)
  - **最后等待大概 18 分钟**

    ![image-20260701150255140](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701150255374.webp)
- **成功**

[grid]
![image-20260701150402905](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701150403121.webp)
![1774879027735-7c62803f-7080-4cc6-bcd0-97f117a78fe1](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701150726549.webp)
[/grid]

### ii. 错误

`2025-04-23 `，这个日期购买的系统板烧录加密了，烧录系统不成功，具体表现为 **SDKManager**烧录 显示未进入恢复模式等等

![image-20260701151012599](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701151012766.webp)

最后通过命令行烧录与比对之前的NX找到了原因

```bash
cd ~/nvidia/nvidia_sdk/JetPack_4.6.6_Linux_JETSON_XAVIER_NX_TARGETS/Linux_for_Tegra
sudo ./flash.sh jetson-xavier-nx-devkit mmcblk0p1 | tee flash_log.txt

# 输出
###############################################################################
# L4T BSP Information:
# R32 , REVISION: 7.6
###############################################################################
# Target Board Information:
# Name: jetson-xavier-nx-devkit, Board Family: t186ref, SoC: Tegra 194, 
# OpMode: production, Boot Authentication: SBKPKC, 
# Disk encryption: disabled ,
###############################################################################
Error: Either RSA key file and/or SBK key file is not provided for SBK and PKC protected target board.
```

说明这块 Jetson Xavier NX **启用了安全启动（Secure Boot）**，需要提供 **SBK（Secure Boot Key）和 PKC（Public Key Cryptography）密钥文件**才能刷机。

- **术语解释**
  - **SBK（Secure Boot Key）**：用于签名引导链，防止非官方 bootloader 启动；
  - **PKC（Public Key Cryptography）**：用于验证 bootloader 是否是合法签名；
  - **SBKPKC 模式**：即设备处于“**烧录必须验证签名**”的状态。

# 3. 配置镜像烧录包

因为更换开机动画与固态盘的镜像烧录需要配置官方的烧录包，所以需要先配置一下环境。

- 参照链接
  - [Jetson Xavier NX 备份与烧录固态系统_jetson xavier beifenxitong-CSDN博客](https://blog.csdn.net/potato123232/article/details/131283429)
- 相对应的pdf文件(防失效)
  - [Jetson Xavier NX 备份与烧录固态系统.pdf](https://1831996731.share.123pan.cn/123pan/wdzVjv-ZKz6v) 

## a. 下载

- **下载地址**
  
  - [Jetson Linux | NVIDIA Developer](https://developer.nvidia.com/embedded/linux-tegra)
  - [Jetson Linux Archive](https://developer.nvidia.com/embedded/jetson-linux-archive)
  
  > [!TIP]
  >
  > 官网这里的话有一个注释，显示这个[Jetson Linux Archive](https://developer.nvidia.com/embedded/jetson-linux-archive)版本是适用于**JetPack 4.6**版本的，所以这个在烧录系统时，需选择**JetPack 4.6**相关版本的，先后使用的版本是4.6.4、4.6.5、4.6.6，最后在使用的是 **JetPack 4.6.6 **版本。
  >
  > `原文说明`
  >
  > - **NVIDIA L4T 32.6.1**
  >   - L4T 32.6.1 supports all Jetson modules: Jetson AGX Xavier series, Jetson Xavier NX, Jetson TX2 series, Jetson TX1, and Jetson Nano. All Jetson developer kits are also supported.
  >   - L4T 32.6.1 is included as part of [JetPack 4.6](https://developer.nvidia.com/jetpack-sdk-46)
  >   - See the online [Jetson Linux Developer Guide](https://docs.nvidia.com/jetson/archives/l4t-archived/l4t-3261/index.html) for detailed documentation.
  
- **下载**
  
  下载这三个东西，版本32.6.1是测试过的，别的版本没测过
  
  - [L4T Driver Package (BSP)](https://developer.nvidia.com/embedded/l4t/r32_release_v6.1/t186/jetson_linux_r32.6.1_aarch64.tbz2)
  - [Sample Root Filesystem](https://developer.nvidia.com/embedded/l4t/r32_release_v6.1/t186/tegra_linux_sample-root-filesystem_r32.6.1_aarch64.tbz2)
  - [Jetson Platform Fuse Burning and Secure Boot Documentation and Tools](https://developer.nvidia.com/embedded/l4t/r32_release_v6.1/t186/secureboot_r32.6.1_aarch64.tbz2)

[grid]
![image-20260701152201079](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701152201199.webp)
![image-20260701152212565](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701152212679.webp)
[/grid]

- **解压**

  把这三个包放在一起，然后打开终端

  ![image-20260701152337522](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701152337661.webp)
  
  ```bash
  # 依次输入下面的命令进行解压(一共大概6分钟)
  tar xf Jetson_Linux_R32.6.1_aarch64.tbz2
  sudo tar xf Tegra_Linux_Sample-Root-Filesystem_R32.6.1_aarch64.tbz2 -C ./Linux_for_Tegra/rootfs/
  sudo tar xf secureboot_R32.6.1_aarch64.tbz2
  ```
  
  解压之后会得到这个
  
  ![image-20260701152450911](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701152451050.webp)

## b. 配置

1. **将Linux_for_Tegra文件夹赋予权限**
   ```bash
   # 使用绝对路径或相对路径
   sudo chmod 777 -R  './Linux_for_Tegra'
   ```
2. **安装缺的包**
   ```bash
   sudo apt-get install qemu-user-static
   sudo apt-get install libxml2-utils
   
   # 如果不安装会导致 Linux_for_Tegra/tools/kernel_flash/images/external ⽬录⽣成系统镜像不成功
   # 并且在该⽬录下会有⽂件形式错误提⽰。
   ```
3. **生成二进制文件**
   ```bash
   # 这一步需要在 Linux_for_Tegra/ 文件夹中执行
   cd Linux_for_Tegra/
   sudo ./apply_binaries.sh
   # 看到最后的success就表示成功
   ```

   ![image-20260701152909823](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701152909982.webp)
4. **修改系统数据**

   ```bash
   cd Linux_for_Tegra/
   
   # nano/vim/vi/gedit 都可以
   gedit ./tools/kernel_flash/flash_l4t_nvme.xml
   ```

   主要修改图中位置的数据

   ![image-20260701153243578](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701153243719.webp)

   > [!TIP]
   >
   > 可以通过登陆到烧录的NX系统中查看固态盘的信息
   >
   > ```bash
   > sudo fdisk -l /dev/nvme0n1
   > ```
   >
   > ![image-20260701153624392](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701153624535.webp)
   >
   > 因为买的创乐博的NX板子，自带了固态盘是**256GB**的，所以这里修改的数据是不对的（这里的是**128GB**的）。
   >
   > 烧录完系统，计入系统终端查看了发现固态盘**256GB**对应的是数据是 **500118192** 。
   >
   > ![image-20260701153818052](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701153818613.webp)
   
   - 不同固态盘所对应的数据
      - **128 GB**  ->  **250069680**
      - **256 GB**  ->  **500118192** 
5. **构建系统镜像**
   ```bash
   cd Linux_for_Tegra/
   # 等待完成
   sudo ./tools/kernel_flash/l4t_initrd_flash.sh --no-flash jetson-xavier-nx-devkit-qspi internal
   ```

   ![image-20260701154622541](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701154622678.webp)

   **之后输入**

   ```bash
   # Linux_for_Tegra/ 目录下
   sudo ./tools/kernel_flash/l4t_initrd_flash.sh --no-flash --external-device nvme0n1p1 -c ./tools/kernel_flash/flash_l4t_nvme.xml -S 118GiB --showlogs jetson-xavier-nx-devkit-emmc nvme0n1p1
   ```

   最后输出以下内容代表成功

   ![image-20260701155042902](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701155043039.webp)
   
   **这两步结束之后能看到 success 就对了，至此需要准备的东西就完毕了，下面开始正式的备份烧入流程**
   
   > [!TIP]
   >
   > 可能出错缺包，依据提示补上缺失的包
   >
   > ```bash
   > sudo apt-get install sshpass
   > sudo apt-get install abootimg
   > ```
   >
   > 并且伴随着的是缺少python,可能是python2,这个是在官网下载的ubuntu18.04镜像(**Date:2025-04-18**),解决安装python
   >
   > ```bash
   > sudo apt-get install python
   > ```
   >
   > ~~这部分问题是在重装了系统，使用了官方的下载的最新**ubuntu18.04**出现的问题，可能有公告，没去仔细寻找。~~  可能不是这个原因，有一次使用**windows下的Win32**构建的启动盘结果没事，这次出问题使用**linux下的balenaEtcher**构建的
   
# 4. 更换开机动画

Jetson 设备开机动画源文件存放路径：`Linux_for_Tegra/bootloader/bmp.blob`

华大科技定制开机动画文件下载链接：[bmp.blob](https://1831996731.share.123pan.cn/123pan/wdzVjv-tApyv)（下载后文件名自带备注，使用时删除括号及内部文字，仅保留 `bmp.blob`）

- **替换文件步骤**
  
  1. 将下载好的 bmp.blob 文件放置到工程主目录；
  2. 依次执行下方两条命令完成替换：
     ```bash
     # 备份原厂默认开机动画文件
     sudo mv ./Linux_for_Tegra/bootloader/bmp.blob ./Linux_for_Tegra/bootloader/bmp.blob.initial
     # 将华大定制开机动画文件移入对应目录并覆盖原文件
     sudo mv bmp.blob ./Linux_for_Tegra/bootloader/bmp.blob
     ```
  
  操作逻辑说明：先把系统原有开机动画重命名备份，再将下载的定制动画文件移入目标路径并命名为 bmp.blob，实现开机画面替换。

> [!TIP]
>
> **备选简化方案（未实测，供尝试）**
>
> - 无需替换原文件，直接修改烧写命令指定镜像文件：
>   1. 把下载的动画文件重命名为 huada.blob；
>   2. 使用以下命令单独烧写开机动画分区：
>      ```bash
>      sudo ./flash.sh -k BMP --image bootloader/huada.blob jetson-xavier-nx-devkit-emmc mmcblk0p1
>      ```

## a. 更换

**进入 Linux_for_Tegra 文件夹，在执行命令**

```bash
cd Linux_for_Tegra/
sudo ./flash.sh -k BMP --image bootloader/bmp.blob jetson-xavier-nx-devkit-emmc mmcblk0p1
```

这个很快，**2 分钟完事了**。

## b. 完成

这里更换了初始开机动画文件后，可能在实施下面的章节 **“固态镜像烧录”** 时，就已经烧进去了。

[grid]
![image-20260701160006383](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701160006580.webp)
![image-20260701160017422](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701160017737.webp)
[/grid]

# 5. 镜像烧录

因为需要烧录的是华大科技给的镜像文件，所以并不是与文章中相对应，因为不是自己备份文件，是现成的，但操作都是一样的。

- 参照链接
  - [Jetson Xavier NX 备份与烧录固态系统_jetson xavier beifenxitong-CSDN博客](https://blog.csdn.net/potato123232/article/details/131283429)
- 相对应的pdf文件(防失效)
  - [Jetson Xavier NX 备份与烧录固态系统.pdf](https://1831996731.share.123pan.cn/123pan/wdzVjv-ZKz6v) 

> [!IMPORTANT]
>
> **将固态盘插到NX上**
>
> ![image-20260701160324136](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701160324311.webp)

## a. 修改文件

1. 进入系统镜像存放目录：`Linux_for_Tegra/tools/kernel_flash/images/external`
2. 将目录中原有的 `system.img` 文件重命名备份为 `system.img.bak`
3. 将从 `bootloader` 中获取的 `nx_rootfs.img` 镜像文件，复制到上述 `external` 目录中
4. 将复制过来的 `nx_rootfs.img` 重命名为 `system.img`

**备注：本次替换使用华大定制系统镜像**

> [!TIP]
>
> - 华大镜像下载链接（已失效）
>
>   ~~[链接（已失效，应该是他们服务器的直链，后来取消了）](http://82.156.233.254:5000/static/2023_12_03/nx_rootfs.img)~~
>
>   **注：该链接网页解析失败，服务器直链已作废，无法使用**
>
> - nx_rootfs.img 镜像现有备份位置
>
>   - ~~1、T7 Linux_for_Tegra 目录下~~
>   - ~~2、配置好系统的触摸屏设备电脑中~~
>   - ~~3、公司硬盘津南安装包目录内~~

  **`2025-04-18` 津南那边更新了镜像，镜像系统是Ubuntu20.04，烧录的平台与烧录系统还是在Ubunut18.04上来进行，只是更换了一个烧录镜像文件。**

津南那边的原话

![image-20260701161110619](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701161110784.webp)

## b. 烧录

更换完系统镜像后，在 `Linux_for_Tegra/` 文件夹下打开终端，然后输入

```bash
sudo ./tools/kernel_flash/l4t_initrd_flash.sh --flash-only --external-device nvme0n1p1 -c ./tools/kernel_flash/flash_l4t_nvme.xml -S 118GiB --showlogs jetson-xavier-nx-devkit-emmc nvme0n1p1
```

烧录时间较长，会在下面第一张图片中那里停留**大概25分钟左右**，然后成功。

[grid]
![image-20260701161335771](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701161335962.webp)
![image-20260701161407149](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701161407354.webp)
![image-20260701161420360](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701161420546.webp)
[/grid]

## c. 调试命令

**不拔下跳线帽，进入系统**，恢复模式下进入系统

在 Linux_for_Tegra/bootloader 目录下

```bash
sudo bash ./bootloader/flashcmd.txt
```

# 6. 模组测试

## a. 安装依赖

最后测试需要从U盘拷贝文件到NX中，但是NX不识别exfat 标识的U盘。

```bash
# 执行以下命令需连接网络
sudo apt-get install exfat-fuse
sudo apt-get install gparted
```

## b. 测试文件

测试文件有两个，一个是拍照并保存照片，一个是通过串口发送数据测试传感器

```python title="camera.py"
import cv2
# 捕获摄像头，0代表笔记本内置摄像头，外置摄像头改为1
cap = cv2.VideoCapture(0)
i = 0
n = 0
while True:
    # 读取图像，ret表示当前帧是否捕获正确，返回布尔值
    ret, frame = cap.read()
    if ret:
        # 将图像显示出来
        cv2.imshow("capture", frame)
    # 画面暂停制定毫秒，期间按了键盘则返回按键的ASCII码，否则返回-1
    k = cv2.waitKey(1)
    n = n + 1
    # 参数为0表示无线等待，代码会阻塞
    # 不调用waitKey，画面只有一片灰色，而且一闪而过
    # 按空格键退出，ord()函数把字母转化为ASCII码
    if k == ord(' '):
        break
    # 按s键保存
    # elif k == ord('s'):
    elif n%30==0:
        # 把图像写入图片
        cv2.imwrite(str(i) + '.jpg', frame)
        i += 1
# 关闭视频捕获器
cap.release()
# 销毁所有窗口
cv2.destroyAllWindows()
```

```python title="control_demo.py"
import serial
import time

def not_screen_command(command):
    ser = serial.Serial('/dev/ttyTHS0', 9600, timeout=0.5)
    if ser.isOpen == False:
        ser.open()
    ser.flushInput()
    ser.flushOutput()
    accept = ''
    while not accept.__contains__('0'):
        ser = serial.Serial('/dev/ttyTHS0', 9600, timeout=0.5)
        if ser.isOpen == False:
            ser.open()
        ser.flushInput()
        ser.flushOutput()
        ser.write(('M!').encode('utf-8'))
        accept = ''
        while accept == '':
            accept = ser.readline()
            print(accept)
        accept = str(accept)
    print('已切换到非屏幕模式')
    ser.write((command).encode('utf-8'))
    time.sleep(2)

time.sleep(2)
not_screen_command('D-0!')
not_screen_command('K-!')
not_screen_command('L-!')
not_screen_command('G-!')
not_screen_command('J-0!')
not_screen_command('A-180!')
not_screen_command('A-000!')
not_screen_command('E-!')
not_screen_command('B-000!')
not_screen_command('B-111!')
not_screen_command('C-!')
not_screen_command('F-1000!')
not_screen_command('F-2000!')
not_screen_command('H-1!')
not_screen_command('H-0!')

def screen_command(command):
    ser = serial.Serial('/dev/ttyTHS0', 9600, timeout=0.5)
    if ser.isOpen == False:
        ser.open()
    ser.flushInput()
    ser.flushOutput()
    accept = ''
    while not accept.__contains__('1'):
        ser = serial.Serial('/dev/ttyTHS0', 9600,timeout=0.5)
        if ser.isOpen == False:
            ser.open()
        ser.flushInput()
        ser.flushOutput()
        ser.write(('M!').encode('utf-8'))
        accept = ''
        while accept == '':
            accept = ser.readline()
            print(accept)
        accept = str(accept)
    print('已切换到屏幕模式')
    ser.write((command).encode('utf-8'))
    ser.write(b'\xFF\xFF\xFF')
    time.sleep(2)

screen_command('page 1')
screen_command('page 2')
screen_command('page 3')
screen_command('page 4')
screen_command('page 5')
screen_command('page 6')
screen_command('page 7')
screen_command('page 8')
screen_command('page 9')
screen_command('page 10')
```

整合了一下，写成一个脚本文件 

```shell title="huadaDesktop.sh"
#!/bin/bash

# 确保 Python 3 可用
if ! command -v python3 &>/dev/null; then
    echo "Python3 未安装，无法继续执行"
    exit 1
fi

# 执行 Python 代码
python3 - <<END
import cv2
import serial
import time
import logging

# 配置日志记录
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# 初始化串口连接
def initialize_serial():
    """ 初始化串口连接 """
    try:
        ser = serial.Serial('/dev/ttyTHS0', 9600, timeout=0.5)
        #ser = serial.Serial('/dev/ttyCH341USB0', 9600, timeout=0.5)
        if not ser.isOpen():
            ser.open()
        ser.flushInput()
        ser.flushOutput()
        return ser
    except serial.SerialException as e:
        logging.error(f"无法打开串口: {e}")
        exit(1)

def not_screen_command(ser, command):
    """ 执行非屏幕操作的命令 """
    try:
        accept = ''
        while '0' not in accept:
            ser.write(('M!').encode('utf-8'))
            accept = ''
            while accept == '':
                accept = ser.readline()
                logging.info(f"接收到串口响应: {accept}")
            accept = str(accept)

        logging.info('已切换到非屏幕模式')
        ser.write(command.encode('utf-8'))
        time.sleep(2)
    except Exception as e:
        logging.error(f"执行非屏幕命令时出错: {e}")

def screen_command(ser, command):
    """ 执行屏幕操作的命令 """
    try:
        accept = ''
        while '1' not in accept:
            ser.write(('M!').encode('utf-8'))
            accept = ''
            while accept == '':
                accept = ser.readline()
                logging.info(f"接收到串口响应: {accept}")
            accept = str(accept)

        logging.info('已切换到屏幕模式')
        ser.write(command.encode('utf-8'))
        ser.write(b'\xFF\xFF\xFF')  # 刷新信号
        time.sleep(2)
    except Exception as e:
        logging.error(f"执行屏幕命令时出错: {e}")

# 全局标志，检测鼠标点击
exit_flag = False

# 鼠标回调函数
def mouse_callback(event, x, y, flags, param):
    global exit_flag
    if event == cv2.EVENT_LBUTTONDOWN:  # 检测鼠标左键点击
        exit_flag = True

def run_camera():
    """ 打开摄像头并显示 """
    cap = cv2.VideoCapture(0)  # 0为内置摄像头，2为外置摄像头
    if not cap.isOpened():
        logging.error("无法打开摄像头")
        exit(1)

    cv2.namedWindow('USB Camera')
    cv2.setMouseCallback('USB Camera', mouse_callback)  # 设置鼠标回调

    start_time = time.time()  # 记录程序开始时间

    while True:
        ret, frame = cap.read()
        if not ret:
            logging.error("无法读取摄像头帧")
            break

        # 计算已运行的时间（秒）
        elapsed_time = int(time.time() - start_time)

        # 在图像上添加时间文本
        font = cv2.FONT_HERSHEY_SIMPLEX
        cv2.putText(frame, f"Time: {elapsed_time}s", (10, 30), font, 1, (0, 255, 0), 2, cv2.LINE_AA)

        cv2.imshow('USB Camera', frame)

        # 如果鼠标左键点击窗口，退出
        if exit_flag:
            break

        # 等待1ms，防止窗口冻结
        cv2.waitKey(1)

    # 释放摄像头资源
    cap.release()
    cv2.destroyAllWindows()
    logging.info("摄像头已关闭。")

def main():
    # 初始化串口
    ser = initialize_serial()

    # 打开摄像头并显示画面
    logging.info("正在打开摄像头...")
    run_camera()

    # 执行非屏幕命令
    logging.info("开始执行非屏幕命令...")
    not_screen_command(ser, 'D-0!')
    not_screen_command(ser, 'K-!')
    not_screen_command(ser, 'L-!')
    not_screen_command(ser, 'G-!')
    not_screen_command(ser, 'J-0!')
    not_screen_command(ser, 'A-180!')
    not_screen_command(ser, 'A-000!')
    not_screen_command(ser, 'E-!')
    not_screen_command(ser, 'B-000!')
    not_screen_command(ser, 'B-111!')
    not_screen_command(ser, 'C-!')
    not_screen_command(ser, 'F-1000!')
    not_screen_command(ser, 'F-2000!')
    not_screen_command(ser, 'H-1!')
    not_screen_command(ser, 'H-0!')

    # 执行屏幕命令
    logging.info("开始执行屏幕命令...")
    screen_command(ser, 'page 1')
    screen_command(ser, 'page 2')
    screen_command(ser, 'page 3')
    screen_command(ser, 'page 4')
    screen_command(ser, 'page 5')
    screen_command(ser, 'page 6')
    screen_command(ser, 'page 7')
    screen_command(ser, 'page 8')
    screen_command(ser, 'page 9')
    screen_command(ser, 'page 10')

    # 关闭串口
    ser.close()
    logging.info("串口已关闭。")

if __name__ == "__main__":
    main()
END
# 检查 Python 程序是否执行成功
if [ $? -eq 0 ]; then
    echo "Python 程序执行完成"
else
    echo "Python 程序执行失败"
    exit 1
fi
```

# 7. 问题

分为了各个章节存在的问题

- **`Part 2`**
  - Q1：**SDK 登录 NVIDIA账号 卡住**
  
    更换手机热点试一试
- **`Part 3`**
  - Q1：**可能会登不上NVIDIA官网**
  
    更换手机热点试一试
  - Q2：**初始化失败**
  
    固态硬盘容量需要对应，如果不是256GB，需要去查询对应固态硬盘容量的颗粒数，再进行重新的系统初始化构建
  
    可以在以烧录系统的NX上，插入对应固态硬盘，输入以下命令查询
    ```bash
    sudo fdisk -l /dev/nvme0n1
    ```
  
    ![image-20260701153624392](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701153624535.webp)
  
    然后再重新执行 **[b. 配置](#b-配置)** 的所有步骤。

- **`Part 4`**

  注意文件别替换错误，华大的开机动画是一张图片，大概在 34 KB 左右

- **`Part 5`**
  - Q1：**执行烧录失败**

    ![image-20260701163922729](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701163922970.webp)

    ```bash
    Error: Return value 24
    Command tegrarcm_v2 --instance 2-2 --download bct_bootrom br_bct_BR.bct --download bct_mb1 mb1_bct_MB1_sigheader.bct.encrypt --download bct_mem mem_rcm_sigheader.bct.encrypt
    Cleaning up...
    ```
    - S1：重新插拔一下 19V 电源线 （大抵是不管用的）
    - S2：重新进行初始化目录 
      ```bash
      # 依次执行以下命令
      sudo ./apply_binaries.sh
      
      sudo ./tools/kernel_flash/l4t_initrd_flash.sh --no-flash jetson-xavier-nx-devkit-qspi internal
      
      sudo ./tools/kernel_flash/l4t_initrd_flash.sh --no-flash --external-device nvme0n1p1 -c ./tools/kernel_flash/flash_l4t_nvme.xml -S 118GiB --showlogs jetson-xavier-nx-devkit-emmc nvme0n1p1
      ```

      第二种方法每次都会把 **[a. 修改文件](#a-修改文件)** 全部清空并初始化，主要是固态烧录镜像文件会删掉，所以可以写一个脚本来替代

      ```shell title="onlyOnce.sh"
      #!/bin/bash
      
      #  将需要烧录的固态镜像移动到主目录
      sudo mv '/home/esteam/Linux_for_Tegra/tools/kernel_flash/images/external/system.img' '/home/esteam'&&
      
      wait
      
      #  进入到 Linux_for_Tegra 目录
      cd Linux_for_Tegra/&&
      
      wait
      
      # 执行初始化NX烧录包第一步
      sudo ./tools/kernel_flash/l4t_initrd_flash.sh --no-flash jetson-xavier-nx-devkit-qspi internal&&
      
      wait
      
      # 执行初始化第二步
      sudo ./tools/kernel_flash/l4t_initrd_flash.sh --no-flash --external-device nvme0n1p1 -c ./tools/kernel_flash/flash_l4t_nvme.xml -S 118GiB --showlogs jetson-xavier-nx-devkit-emmc nvme0n1p1&&
      
      # 等待 20 s
      sleep 20
      
      # 返回上一级目录
      cd ..&&
      
      wait
      
      # 赋予 Linux_for_Tegra/tools/kernel_flash/images/external 文件夹 777 权限
      sudo chmod 777 -R '/home/esteam/Linux_for_Tegra/tools/kernel_flash/images/external'&&
      
      wait
      
      # 将初始固态镜像 system.img 改名为 system.img.bak
      sudo mv '/home/esteam/Linux_for_Tegra/tools/kernel_flash/images/external/system.img' '/home/esteam/Linux_for_Tegra/tools/kernel_flash/images/external/system.img.bak'&&
      
      wait
      
      # 将最开始移动到主目录的 需要烧录的固态镜像 移动回来
      sudo mv '/home/esteam/system.img' '/home/esteam/Linux_for_Tegra/tools/kernel_flash/images/external'&&
      
      wait
      ```


# 8. 流程

以后烧录的流程如最开始所说的，去掉搭建平台这一步骤就可以了

~~**烧录系统镜像** --> **更换开机动画** --> **在固态盘的镜像烧录**~~

> [!WARNING]
>
> ~~好像 **先烧录固态盘的镜像，在更换开机动画**，可以不用初始化流程，也就是 **七 、问题** --> **Part 5** 问题。~~

> [!TIP]
>
> 这里的问题在于更换开机动画后，会出现 **七 、问题** --> **Part 5** 问题，所以以后烧录可以先一次性烧录单一的种类。比如先全部烧录固态盘镜像，在全部更换开机动画。或者换过来，这样就不用每次都初始化NX烧录包了。

- Step 1：烧录系统镜像
  - 参考 **2.系统烧录**
- Step 2：烧录固态盘镜像
  - 参考 **5. 镜像烧录**
- Step 3：更换开机动画
  - 参考 **4. 更换开机动画**

## a. 一键脚本

### i. 脚本结构

但是截止写文档的这次烧录，好像每次都需要初始化，也就是执行 **七 、问题** --> **Part 5** , 这不清楚是为什么，但是可以写一个自动化脚本用来检测输入，然后选择操作。

暂定为下面的交互结构（适用于烧录过程，不适用搭建）

- **nx_init.sh**
  - 脚本使用说明
  - 查询固态盘状况
  - 烧录图片
    - 返回错误 
      - 打印错误信息
        - 继续执行 烧录图片
        - 返回初始界面
    - 返回正确
      - 执行 烧录图片
  - 烧录固态盘镜像
    - 返回错误 
      - 继续执行 烧录固态盘镜像
      - 初始化以后 烧录固态盘镜像
    - 返回正确
      - 执行 烧录固态盘镜像
  - 恢复模式下，进入系统
  - 初始化以后 烧录固态盘镜像

### ii. 内容

这个应该不是最新的

```shell title="nx_init.sh"
#!/bin/bash


# 临时拷贝脚本（只在第一次运行时执行）
if [ -z "$IN_NEW_TERMINAL" ]; then
 export IN_NEW_TERMINAL=1

 # 创建临时脚本副本
 tmp_script="/tmp/$(basename "$0")"
 cp "$0" "$tmp_script"
 chmod +x "$tmp_script"

 if command -v gnome-terminal &> /dev/null; then
     gnome-terminal -- bash -c "sudo -v && '$tmp_script'; exec bash"
 elif command -v konsole &> /dev/null; then
     konsole -e bash -c "sudo -v && '$tmp_script'; exec bash"
 elif command -v xterm &> /dev/null; then
     xterm -hold -e bash -c "sudo -v && '$tmp_script'; exec bash"
 else
     echo "未找到支持的终端模拟器！"
     exit 1
 fi
 exit 0
fi

# 真正的脚本逻辑
echo "成功进入新终端并执行脚本。"



# 请求 sudo 权限并保持
sudo -v
# 使脚本在获取到 sudo 权限后继续运行
while true; do sudo -v; sleep 60; done &

# 定义颜色
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # 无颜色

# 定义 Linux_for_Tegra 目录
L4T_DIR="$HOME/Linux_for_Tegra"

ECHO_DATE=$(date '+%Y年%m月%d日')  # 当前日期

function enter_l4t_dir {
cd "$L4T_DIR" || { echo -e "${RED}🚫 错误：无法进入目录: $L4T_DIR 该目录不存在。${NC}"; return 1; }
return 0
}

function flash_image {
echo -e "\n============================"
echo -e "${BLUE}🖥️ 开始烧录开机动画...${NC}"

if enter_l4t_dir && sudo ./flash.sh -k BMP --image bootloader/bmp.blob jetson-xavier-nx-devkit-emmc mmcblk0p1; then
echo -e "${GREEN}✅ 烧录成功！${NC}"
else
echo -e "${RED}❌ 烧录失败，请查看以下错误信息：${NC}"
tail -n 10 /var/log/syslog # 显示最近的错误信息
handle_flash_failure "烧录开机动画"
fi
}

function flash_nvme_image {
echo -e "\n============================"
echo -e "${BLUE}🖥️ 开始烧录固态盘镜像...${NC}"

if enter_l4t_dir && sudo ./tools/kernel_flash/l4t_initrd_flash.sh --flash-only --external-device nvme0n1p1 -c ./tools/kernel_flash/flash_l4t_nvme.xml -S 118GiB --showlogs jetson-xavier-nx-devkit-emmc nvme0n1p1; then
echo -e "${GREEN}✅ 固态盘镜像烧录成功！${NC}"
else
echo -e "${RED}❌ 固态盘镜像烧录失败，请查看以下错误信息：${NC}"
tail -n 10 /var/log/syslog # 显示最近的错误信息
handle_nvme_flash_failure
fi
}

function handle_flash_failure {
local action=$1
echo -e "\n****************************************"
echo -e "${YELLOW}您可以选择：${NC}"
echo "1. 重新执行 ${action}"
echo "2. 返回主菜单"
echo -e "****************************************"
read -p "$(echo -e "${YELLOW}请输入选项: ${NC}")" choice
case "$choice" in
        1) flash_image ;;
        2) return ;;
        *) echo -e "${RED}❌ 无效的选择，返回主菜单。${NC}" ; return ;;
    esac
}

function handle_nvme_flash_failure {
    echo -e "\n****************************************"
    echo -e "${YELLOW}您可以选择：${NC}"
    echo "1. 继续执行烧录固态盘镜像"
    echo "2. 初始化NX烧录包并烧录固态盘镜像"
    echo "3. 返回主菜单"
    echo -e "****************************************"
    read -p "$(echo -e "${YELLOW}请输入选项: ${NC}")" choice
    case "$choice" in
        1) flash_nvme_image ;;
        2) initialize_and_flash ;;
        3) return ;;
        *) echo -e "${RED}❌ 无效的选择，返回主菜单。${NC}" ; return ;;
    esac
}

function initialize_and_flash {
    echo -e "\n============================"
    echo -e "${BLUE}🔧 正在执行初始化NX烧录包...${NC}"

    if enter_l4t_dir; then
        echo -e "${YELLOW}📦 正在移动固态盘镜像文件到主目录...${NC}"
        sudo mv './tools/kernel_flash/images/external/system.img' "/tmp/" &&

        echo -e "${YELLOW}🔒 正在设置文件为只读权限...${NC}"
        sudo chmod 444 "/tmp/system.img" &&

        echo -e "${YELLOW}⚙️ 执行初始化NX烧录包第一步...${NC}"
        sudo ./apply_binaries.sh &&

        echo -e "${YELLOW}⚙️ 执行初始化NX烧录包第二步...${NC}"
        sudo ./tools/kernel_flash/l4t_initrd_flash.sh --no-flash jetson-xavier-nx-devkit-qspi internal &&

        echo -e "${YELLOW}⚙️ 执行初始化NX烧录包第三步...${NC}"
        sudo ./tools/kernel_flash/l4t_initrd_flash.sh --no-flash --external-device nvme0n1p1 -c ./tools/kernel_flash/flash_l4t_nvme.xml -S 118GiB --showlogs jetson-xavier-nx-devkit-emmc nvme0n1p1 &&

        sleep 20

        echo -e "${YELLOW}🔧 赋予 './tools/kernel_flash/images/external' 文件夹 777 权限...${NC}"
        sudo chmod 777 -R './tools/kernel_flash/images/external' &&

        echo -e "${YELLOW}📝 将初始固态镜像 'system.img' 改名为 'system.img.bak'...${NC}"
        sudo mv './tools/kernel_flash/images/external/system.img' './tools/kernel_flash/images/external/system.img.bak' &&

        echo -e "${YELLOW}🔓 解除只读权限...${NC}"
        sudo chmod 666 "/tmp/system.img" &&

        echo -e "${YELLOW}📥 将移动到主目录的固态镜像文件移回原目录...${NC}"
        sudo mv "/tmp/system.img" './tools/kernel_flash/images/external' &&

        echo -e "${GREEN}✅ 初始化NX烧录包完成，开始烧录固态盘镜像...${NC}"
        flash_nvme_image
    else
        echo -e "${RED}🚫 错误：无法进入目录: $L4T_DIR${NC}"
    fi
}

function initialize_NX_Burn {
    echo -e "\n============================"
    echo -e "${BLUE}🔧 请将需要烧录的固态镜像文件放在主目录下...${NC}"
    echo -e "${BLUE}🔧 并将其名称更换为：system.img ...${NC}"
    echo -e "${BLUE}🔧 并且将 flash_l4t_nvme.xml 文件需要修改的地方与对应固态硬盘一致...${NC}"
    echo "1. 继续执行"
    echo "2. 返回主菜单"
    read -p "$(echo -e "${YELLOW}请输入选项: ${NC}")" choice

    case "$choice" in
        1)
            echo -e "${BLUE}🔧 正在执行初始化NX烧录包...${NC}"
            if enter_l4t_dir; then
                echo -e "${YELLOW}⚙️ 执行初始化NX烧录包第一步...${NC}"
                sudo ./apply_binaries.sh &&

                echo -e "${YELLOW}⚙️ 执行初始化NX烧录包第二步...${NC}"
                sudo ./tools/kernel_flash/l4t_initrd_flash.sh --no-flash jetson-xavier-nx-devkit-qspi internal &&

                echo -e "${YELLOW}⚙️ 执行初始化NX烧录包第三步...${NC}"
                sudo ./tools/kernel_flash/l4t_initrd_flash.sh --no-flash --external-device nvme0n1p1 -c ./tools/kernel_flash/flash_l4t_nvme.xml -S 118GiB --showlogs jetson-xavier-nx-devkit-emmc nvme0n1p1 &&

                sleep 20

                echo -e "${YELLOW}🔧 赋予 './tools/kernel_flash/images/external' 文件夹 777 权限...${NC}"
                sudo chmod 777 -R './tools/kernel_flash/images/external' &&

                echo -e "${YELLOW}📝 将初始固态镜像 'system.img' 改名为 'system.img.bak'...${NC}"
                sudo mv './tools/kernel_flash/images/external/system.img' './tools/kernel_flash/images/external/system.img.bak' &&

                echo -e "${YELLOW}📥 将移动到主目录的固态镜像文件移回原目录...${NC}"
                sudo mv "$HOME/system.img" './tools/kernel_flash/images/external' &&
                echo -e "${YELLOW} ... ... ${NC}"
            else
                echo -e "${RED}🚫 错误：无法进入目录: $L4T_DIR${NC}"
            fi
            ;;
        2)
            return ;;  # 返回主菜单，结束当前函数
        *)
            echo -e "${RED}❌ 无效的选项，请输入 1 或 2。${NC}"
            ;;
    esac
}

function buildBurnEnv {
    # 检测是否存在 Linux_for_Tegra 目录
    if [ -d "$L4T_DIR" ]; then
        echo -e "${RED}检测到目录：$L4T_DIR${NC}"
        echo -n "是否删除该目录？(y/n): "
        read -r CONFIRM_DELETE

        if [[ "$CONFIRM_DELETE" =~ ^[Yy]$ ]]; then
            echo -e "${GREEN}正在删除目录：$L4T_DIR...${NC}"
            rm -rf "$L4T_DIR"
            echo -e "${GREEN}目录已成功删除。继续执行下一步操作。${NC}"
        else
            echo -e "${RED}用户选择不删除目录：$L4T_DIR。退出操作。${NC}"
            return 1  # 退出函数
        fi
    else
        echo -e "${GREEN}未检测到目录：$L4T_DIR，继续操作。${NC}"
    fi

    # 检查是否存在烧录包
    if [ -f "$HOME/jetson_linux_r32.6.1_aarch64.tbz2" ] && \
       [ -f "$HOME/tegra_linux_sample-root-filesystem_r32.6.1_aarch64.tbz2" ] && \
       [ -f "$HOME/secureboot_r32.6.1_aarch64.tbz2" ]; then
        echo -e "${RED}检测到以下文件已经存在：${NC}"
        echo -e "jetson_linux_r32.6.1_aarch64.tbz2"
        echo -e "tegra_linux_sample-root-filesystem_r32.6.1_aarch64.tbz2"
        echo -e "secureboot_r32.6.1_aarch64.tbz2"
        echo -n "是否使用现有的压缩包继续操作？(y/n): "
        read -r CONFIRM_USE_EXISTING

        if [[ "$CONFIRM_USE_EXISTING" =~ ^[Yy]$ ]]; then
            echo -e "${GREEN}将使用现有的压缩包，跳过下载步骤。${NC}"
        else
            echo -n "是否删除现有的压缩包并重新下载？(y/n): "
            read -r CONFIRM_DELETE_ARCHIVES

            if [[ "$CONFIRM_DELETE_ARCHIVES" =~ ^[Yy]$ ]]; then
                echo -e "${RED}正在删除现有的压缩包...${NC}"
                rm -f "$HOME/jetson_linux_r32.6.1_aarch64.tbz2"
                rm -f "$HOME/tegra_linux_sample-root-filesystem_r32.6.1_aarch64.tbz2"
                rm -f "$HOME/secureboot_r32.6.1_aarch64.tbz2"
                echo -e "${GREEN}现有压缩包已成功删除，开始重新下载。${NC}"
            else
                echo -e "${GREEN}用户选择保留现有压缩包，跳过下载步骤。${NC}"
            fi
        fi
    else
        echo -e "${GREEN}未检测到烧录包，开始下载步骤。${NC}"
    fi

    # 如果需要下载，则执行下载操作
    if [ ! -f "$HOME/jetson_linux_r32.6.1_aarch64.tbz2" ] || \
       [ ! -f "$HOME/tegra_linux_sample-root-filesystem_r32.6.1_aarch64.tbz2" ] || \
       [ ! -f "$HOME/secureboot_r32.6.1_aarch64.tbz2" ]; then
        # 返回主目录
        echo -e "返回到用户主目录..."
        cd $HOME || return 1  # 如果失败则退出

        # 下载烧录包
        echo -e "${GREEN}正在下载 L4T Driver Package...${NC}"
        wget -q --show-progress https://developer.nvidia.com/embedded/l4t/r32_release_v6.1/t186/jetson_linux_r32.6.1_aarch64.tbz2

        echo -e "${GREEN}正在下载 Sample Root Filesystem...${NC}"
        wget -q --show-progress https://developer.nvidia.com/embedded/l4t/r32_release_v6.1/t186/tegra_linux_sample-root-filesystem_r32.6.1_aarch64.tbz2

        echo -e "${GREEN}正在下载 Secure Boot Documentation...${NC}"
        wget -q --show-progress https://developer.nvidia.com/embedded/l4t/r32_release_v6.1/t186/secureboot_r32.6.1_aarch64.tbz2
    fi

    # 安装依赖
    echo -e "${GREEN}正在安装所需的依赖包...${NC}"
    sudo apt-get install -y qemu-user-static libxml2-utils pv


    echo -e "${GREEN}正在解压下载的文件到 Linux_for_Tegra 目录...${NC}"
    pv jetson_linux_r32.6.1_aarch64.tbz2 | tar -xvjf -  # 使用 pv 来显示进度条
    sudo pv tegra_linux_sample-root-filesystem_r32.6.1_aarch64.tbz2 | tar -xvjf - -C ./Linux_for_Tegra/rootfs/
    sudo pv secureboot_r32.6.1_aarch64.tbz2 | tar -xvjf -  # 使用 pv 显示进度条


    # 修改权限
    echo -e "${GREEN}正在赋予 Linux_for_Tegra 目录 777 权限...${NC}"
    sudo chmod 777 -R $HOME/Linux_for_Tegra

    # 询问是否删除下载的压缩包
    echo -n "是否删除所有下载的压缩包？(y/n): "
    read -r CONFIRM_DELETE_ARCHIVES

    if [[ "$CONFIRM_DELETE_ARCHIVES" =~ ^[Yy]$ ]]; then
        echo -e "${RED}正在删除所有下载的压缩包...${NC}"
        rm -f jetson_linux_r32.6.1_aarch64.tbz2
        rm -f tegra_linux_sample-root-filesystem_r32.6.1_aarch64.tbz2
        rm -f secureboot_r32.6.1_aarch64.tbz2
        echo -e "${GREEN}所有压缩包已成功删除。${NC}"
    else
        echo -e "${GREEN}压缩包已保留。${NC}"
    fi

    # 结束
    echo -e "${GREEN}NX烧录包准备步骤已完成！${NC}"
}

Backup() {
    # 自动生成正确的密码（年月日格式）
    CORRECT_PASSWORD=$(date '+%Y%m%d')  # 获取当前日期

    # 提示用户输入密码
    echo -e "${RED}请输入密码以继续操作：${NC}"
    read -s PASSWORD_INPUT  # -s 隐藏用户输入的内容

    # 验证密码
    if [ "$PASSWORD_INPUT" != "$CORRECT_PASSWORD" ]; then
        echo -e "${RED}密码错误！退出操作。${NC}"
        return 1  # 退出函数
    fi

    while true; do
        clear
        # 继续脚本的主要操作
        echo -e "******************"
        echo -e "${RED} ⚠️ 注意：以下操作慎用！！！ ${NC}"
        echo -e "${RED} 以下步骤分别是Linux_for_Tegra包，也就是NX镜像烧录包的环境搭建。${NC}"
        echo -e "${RED} 步骤依次是下载烧录包、修改文件、初始化烧录包 \n${NC}。"
        echo -e "******************"
        echo -e " 1）下载NX烧录包(Linux_for_Tegra)"
        echo -e " 2）初始化NX镜像烧录包不同的固态硬盘需要修改的文件信息"
        echo -e " 3）初始化NX镜像烧录包"
        echo -e " 4）返回主菜单"
        echo -e "******************"
        echo -n "请输入数字 (1-4): "
        read -r input_backup

        case "$input_backup" in
            1)
                # 调用下载NX镜像烧录包的函数
                if declare -f buildBurnEnv > /dev/null; then
                    buildBurnEnv
                else
                    echo -e "${RED}Error: 未定义函数 buildBurnEnv。${NC}"
                fi
                ;;

            2)
                # 初始化NX烧录包之前需要查看固态硬盘信息
                echo -e "初始化NX烧录包之前需要查看一下固态盘的信息："
                echo -e "sudo fdisk -l /dev/nvme0n1"
                echo -e "查看清楚后，在修改文件 ${BLUE}Linux_for_Tegra/tools/kernel_flash/flash_l4t_nvme.xml${NC}"
                echo -e "文件中对应的 ${RED}sector_size 与 num_sectors\n${NC}"
                echo -e "以下是我用过固态硬盘查询的信息："
                echo -e "1）128GB   ${GREEN}sector_size=\"512\" num_sectors=\"250069680\"${NC}"
                echo -e "2）256GB   ${GREEN}sector_size=\"512\" num_sectors=\"500118192\"${NC}"
                echo -e "3）${GREEN}自定义固态硬盘信息${NC}"
                echo -n "请确认您的固态硬盘信息并输入数字 (1-3)："
                read -r input_ssd

                # 检查文件是否存在
                file_path="Linux_for_Tegra/tools/kernel_flash/flash_l4t_nvme.xml"
                if [ ! -f "$file_path" ]; then
                    echo -e "${RED}错误：文件 $file_path 不存在！请检查文件路径。${NC}"
                    echo -e "\n按任意键返回菜单..."
                    read -n 1
                    continue 
                fi

                case "$input_ssd" in
                    1)
                        # 修改文件中的 sector_size 和 num_sectors 为 128GB 固态硬盘的配置
                        echo -e "修改固态硬盘信息为：128GB (sector_size=\"512\", num_sectors=\"250069680\")"
                        sed -i 's/sector_size="[^"]*"/sector_size="512"/' "$file_path"
                        sed -i 's/num_sectors="[^"]*"/num_sectors="250069680"/' "$file_path"
                        if [ $? -eq 0 ]; then
                            echo -e "${GREEN}文件修改成功。${NC}"
                        else
                            echo -e "${RED}文件修改失败，请检查权限或文件内容格式。${NC}"
                        fi
                        ;;

                    2)
                        # 修改文件中的 sector_size 和 num_sectors 为 256GB 固态硬盘的配置
                        echo -e "修改固态硬盘信息为：256GB (sector_size=\"512\", num_sectors=\"500118192\")"
                        sed -i 's/sector_size="[^"]*"/sector_size="512"/' "$file_path"
                        sed -i 's/num_sectors="[^"]*"/num_sectors="500118192"/' "$file_path"
                        if [ $? -eq 0 ]; then
                            echo -e "${GREEN}文件修改成功。${NC}"
                        else
                            echo -e "${RED}文件修改失败，请检查权限或文件内容格式。${NC}"
                        fi
                        ;;

                    3)
                        # 自定义固态硬盘，要求用户输入 sector_size 和 num_sectors
                        echo -e "请输入自定义的 sector_size："
                        read -r custom_sector_size
                        echo -e "请输入自定义的 num_sectors："
                        read -r custom_num_sectors

                        # 确保用户输入的值非空
                        if [ -z "$custom_sector_size" ] || [ -z "$custom_num_sectors" ]; then
                            echo -e "${RED}输入无效，sector_size 和 num_sectors 不能为空！${NC}"
                            echo -e "\n按任意键返回菜单..."
                            read -n 1
                            continue
                        fi

                        # 修改文件中的 sector_size 和 num_sectors 为用户自定义的配置
                        echo -e "修改固态硬盘信息为：sector_size=\"$custom_sector_size\", num_sectors=\"$custom_num_sectors\""
                        sed -i "s/sector_size=\"[^\"]*\"/sector_size=\"$custom_sector_size\"/" "$file_path"
                        sed -i "s/num_sectors=\"[^\"]*\"/num_sectors=\"$custom_num_sectors\"/" "$file_path"
                        if [ $? -eq 0 ]; then
                            echo -e "${GREEN}文件修改成功。${NC}"
                        else
                            echo -e "${RED}文件修改失败，请检查权限或文件内容格式。${NC}"
                        fi
                        ;;

                    *)
                        echo -e "${RED}无效选择，请输入 1、2 或 3。${NC}"
                        ;;
                esac
                ;;

            3)
                # 调用初始化NX烧录包的函数
                if declare -f initialize_NX_Burn > /dev/null; then
                    initialize_NX_Burn
                else
                    echo -e "${RED}Error: 未定义函数 initialize_NX_Burn。${NC}"
                fi
                ;;

            4)
                echo -e "${GREEN}返回主菜单...${NC}"
                break
                ;;

            *)
                echo -e "${RED}无效输入，请输入 1-4。${NC}"
                ;;
        esac
        echo -e "\n按任意键返回菜单..."
        read -n 1
    done
}




function script_and_explain {
    # 脚本说明
    echo -e "${BLUE}************************ 脚本说明 ************************${NC}"
    echo -e "${YELLOW}本脚本用于JetsonXavier NX烧录操作，包括烧录开机动画和固态盘镜像等任务。${NC}"
    echo -e "${GREEN}⚠️ 使用前，请确保您已根据NVIDIA官方文档正确安装了 Linux_for_Tegra ，并配置好相关环境。${NC}"

    echo -e "${BLUE}************** 请检查以下硬件连接是否正确： **************${NC}"
    echo -e "${RED}1. 电源                  2. 显示器            ${NC}"
    echo -e "${RED}3. USB 烧录线            4. 短接线（用于短接 FC REC 和 GND 引脚）\n${NC}"

    echo -e "${BLUE}*** 请确保开发板已置于恢复模式，然后继续执行以下步骤： ***${NC}"
    echo -e "${GREEN}✅ 步骤 1：开始为所有JetsonXavier NX设备烧录系统镜像和固态盘镜像...${NC}"
    echo -e "${GREEN}✅ 步骤 2：将为所有JetsonXavier NX设备更换开机动画...\n${NC}"

}

while true; do
    clear
    script_and_explain
    echo -e "******************"
    echo -e "${YELLOW}📅 $ECHO_DATE ${NC}"
    echo -e "${YELLOW}🛠️  请选择操作：${NC}"
    echo "1）固态盘信息(NX中使用)"
    echo "2）恢复模式下(短接引脚)，进入系统"
    echo "3）烧录开机动画"
    echo "4）烧录固态盘镜像"
    echo "5）备份操作"
    echo "6）退出"
    echo -e "******************"
    echo -n "请输入数字 (1-6): "
    read -r input

    case "$input" in
        1) 
            echo "列出固态盘的所有分区，包括分区的大小、类型、文件系统等信息。"
            echo "在NVIDIA Jetson Xavier NX 终端中输入以下命令。"
            echo "sudo fdisk -l /dev/nvme0n1"
            ;;
        2) 
            if enter_l4t_dir; then
                echo -e "${YELLOW}🛠️ 正在进入系统，请确保您已经烧录了系统镜像...${NC}"

                if cd bootloader/ && sudo bash ./flashcmd.txt; then
                    echo -e "${GREEN}🚀 系统正在启动...${NC}"
                else
                    echo -e "${RED}❌ 错误：无法进入系统，请检查命令或系统镜像。${NC}"
                fi
            fi
            ;;
        3) flash_image ;;
        4) flash_nvme_image ;;
        5) Backup ;;
        6) echo -e "${GREEN}👋 退出脚本。${NC}" ; break ;;
        *) echo -e "${RED}❌ 无效的输入，请输入 1-6。${NC}" ;;
    esac

    echo
    read -p "按回车键继续..." 
done
```

### iii. 加密并执行

最后使用 AppImageTool 工具打包成了 **.AppImage** 格式进行了使用

> ~~先下载~~
>
> ~~**`sudo apt-get install shc`**~~
>
> ~~使用 shc 对脚本进行加密。运行以下命令：~~
>
> ~~**`shc -f script.sh`**~~
>
> ~~**此命令将生成两个文件：**~~
>
> ~~**script.sh.x：加密后的可执行二进制文件。**~~
>
> ~~**script.sh.x.c：生成的** C 源文件（可选，供后续参考或重新编译）。~~
>
> ~~**运行加密后的脚本** 你可以直接运行生成的二进制文件，而无需安装 shc。使用以下命令：~~
>
> ~~**`./script.sh.x`**~~
>
> ~~**生成的** script.sh.x 文件是独立的二进制文件，能够在相同架构的系统上执行。~~
>
> ~~最后放到了 .econfig文件夹中了。~~
>
> 修改了脚本文件，变成了启动对应的AppImage文件
>
> 在NX运行不成功，也就是Arm上不行，X86没问题。
>
> 按理说它是可以在Arm生成运行的，但是不成功，不知道为什么！

## b. 出厂信息

新添加了一个脚本，用于出厂信息的查验，使用就是执行脚本后输入命令 `ysd_info`查看

```shell title="ysd_info"
#!/bin/bash

# 定义常量（工厂信息参数，集中管理便于修改）
BURN_OS_VERSION="Ubuntu 18.04"
JETPACK_VERSION="JetPack v4.6.6"
IMAGE_VERSION="JetImage v2.0.0"
IMAGE_OS_VERSION="Ubuntu 20.04"
# 烧录日期：使用安装脚本执行时的当前日期（仅记录一次）
BURN_DATE=$(date "+%Y-%m-%d")

# 目标命令路径
YSD_INFO_PATH="/usr/local/bin/ysd_info"

# 函数：打印状态信息（统一格式，便于识别）
log() {
    echo "[$(date "+%H:%M:%S")] $1"
}

# 1. 清理旧版本（若存在）
if [[ -f "$YSD_INFO_PATH" ]]; then
    if sudo rm -f "$YSD_INFO_PATH"; then
        log "已移除旧版本命令: $YSD_INFO_PATH"
    else
        log "警告：移除旧版本命令失败，可能影响安装（继续尝试）"
    fi
fi

# 2. 生成ysd_info命令（内置工厂信息）
# 使用printf而非cat，避免EOF转义问题；变量通过格式化传入，逻辑更清晰
sudo printf '#!/bin/bash

# 工厂信息（自动生成，请勿手动修改）
burn_os_version="%s"
jetpack_version="%s"
burn_os_date="%s"

image_version="%s"
image_os_version="%s"
image_burn_date="%s"

# 打印信息（统一对齐格式）
echo "========== 烧录系统信息 =========="
printf "烧录系统版本    : %%s\\n" "$burn_os_version"
printf "JetPack版本      : %%s\\n" "$jetpack_version"
printf "烧录系统时间    : %%s\\n" "$burn_os_date"

echo ""
echo "========== 烧录镜像信息 =========="
printf "镜像版本        : %%s\\n" "$image_version"
printf "镜像系统版本    : %%s\\n" "$image_os_version"
printf "镜像烧录时间    : %%s\\n" "$image_burn_date"
' "$BURN_OS_VERSION" "$JETPACK_VERSION" "$BURN_DATE" \
  "$IMAGE_VERSION" "$IMAGE_OS_VERSION" "$BURN_DATE" > "$YSD_INFO_PATH"

# 3. 检查命令生成是否成功
if [[ $? -ne 0 || ! -f "$YSD_INFO_PATH" ]]; then
    log "错误：生成命令文件失败，请检查权限"
    exit 1
fi

# 4. 设置执行权限
if sudo chmod +x "$YSD_INFO_PATH"; then
    log "权限设置成功"
else
    log "错误：无法设置执行权限，命令可能无法运行"
    exit 1
fi

# 5. 验证安装结果
if command -v ysd_info &>/dev/null; then
    log "✅ 安装完成！可执行 'ysd_info' 查看工厂信息"
else
    log "警告：命令安装成功，但未加入环境变量（可能需要手动执行 $YSD_INFO_PATH）"
fi
```

`ysd_info` 输出信息

```bash
========== 烧录系统信息 ==========
烧录系统版本    : Ubuntu 18.04
JetPack版本      : JetPack v4.6.6
烧录系统时间    : 2025-05-12

========== 烧录镜像信息 ==========
镜像版本        : JetImage v2.0.0
镜像系统版本    : Ubuntu 20.04
镜像烧录时间    : 2025-05-12

```

# 9. RC主控板烧录与传感器测试

## a. RC主控板

### i. 烧录程序位置

![image-20260701165704812](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701165705082.webp)

### ii. PCB位置

![image-20260701165720241](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701165720506.webp)

### iii. 烧录工具

![image-20260701165736807](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701165737172.webp)

## b. 传感器

暂无

# 附录一

![image-20260701165756800](https://vip.123pan.cn/1831996731/a_PicBed/project/huada-desktop-module/20260701165758005.webp)



---



