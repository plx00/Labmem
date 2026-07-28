---
title: 大黄蜂4WD底盘（一）
published: 2024-03-18
updated: 2026-07-27
description: 大黄蜂4WD底盘的主控系统板搭建
image: /assets/bolg_cover/hornet-base-01.webp
tags: [ROS, Jetson, 自动导航]
category: 项目
draft: false
author: larry
password: ""
passwordHint: ""
---

---

# 前言

原先是一个文档，现在分开为两个：**[大黄蜂4WD底盘（二）](/posts/project/hornet-base-02/)**

后续可能在更新一个新的文档, 重新定义这个功能包和写一个对应的上位机软件

> 这个文档是在已经导航实现差不多的情况下，想优化一下导航的实现方法，换一种能够3D建图，重定位方法，结果导致系统崩盘的重新装系统的惨痛教训！！ 以后新的项目写文档！！ 别轻易编译系统构建工具，别升级cmake ！！ 啊啊啊啊！！或者说我还是太菜了？—— ？

`无从下手！`

![212](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260727160230109.gif)





# 1. 重装NX系统、SSD硬盘清空

> [!NOTE]
>
> **SSD硬盘清空**操作未执行，只是拿了一块新的128GB的SSD，防止原先SSD硬盘资料数据丢失

**`参考网址：`**[Jetson Xavier NX配置全过程——系统与SDK烧录（一）_jetson系统烧录环境搭建-CSDN博客](https://blog.csdn.net/weixin_47606814/article/details/127841948)

或者说依据安装系统重来一遍，因为参考网址里面有格式化硬盘的操作。

再重装之前把SSD硬盘拔下来，然后接上屏幕，开机什么的也显示正常，这说明也可以加一个新的SSD硬盘在配置一下也可以，但是为了记录如何烧录NX系统，所以重新装一下系统先。

![image-20260728111928579](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728111935952.webp)

## a. 烧录/重装系统

1. 使用烧录NX的电脑，打开 **SDK Manger**

   关于如何配置**SDK Manger**网上资料很多，参考网址也有说明，这里直接使用。

   打开并点击 **LOGIN**，这里会弹出网页登录你的 **NVIDIA** 账号即可，没有的话就去注册一下，登录进去后我们就可以拿出来我们的 **Jetson Xavier NX** 了。

   `用跳线帽或者杜邦线将 REC 和 GND 引脚短接，也就是连接到核心板下方载板的第二和第三个引脚（划重点，这一步很重要）`

   ![image-20260728113349242](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728113349635.webp)

2. 使用micro-USB 数据线连接Jetson Xavier NX和电脑，并给Jetson Xavier NX上电。这时候会出现如下的弹窗，如果你和我一样是eMMC版本的就直接选择第一个P3668-0001，如果是进口官网套件（插TF卡版本）的就选择P3668-0000。

   ![image-20260728113531813](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728113532479.webp)

3. `取消勾选 Host Machine和DeepStream`，Host Machine是在你主机或者虚拟机上也安装环境，耽误时间且没有卵用，DeepStream在后面安装Jetson SDK Components时我们在选择。

   ![aa](https://1831996731.cdn.123clouddisk.com/1831996731/a_PicBed/project/hornet-base/20260728113554555.webp)

4. 点击CONTINUE，我们进行下一步，因为eMMC只有**16GB**，所以我们先只安装Jetson OS。勾选Jetson OS和最下面的I accept the terms and conditions of the license agreements，路径不需要修改也没必要修改，点击CONTINUE。

   ![image-20260728113712087](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728113712305.webp)

5. 在弹窗中**输入管理员密码**，开始下载Jetson OS。
  
      ![image-20260728113738412](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728113738716.webp)
   
6. 下载好并成功创建好文件后会出现弹框，我们选择`Manual Setup - Jetson Xavier NX`手动安装，并在`New Username`、`New Password` 上填入系统的**用户名、密码**。最后一定要注意`Storage Device`一定一定一定要选择**EMMC/SD Card (default)**，这个选项也是默认的不需要更改。选择完后点击**Flash**就开始往Jetson Xavier NX中烧录系统了。
  
      ![image-20260728113818855](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728113819052.webp)
   
7. 烧录完成后点击FINISH AND EXIT，Jetson OS系统到这里就安装完成了。如果接上了显示器应该可以看到画面。
  
      ![image-20260728113850792](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728113851826.webp)
   
8. Jetson Xavier NX断电后，取下跳线帽或杜邦线和microUSB 数据线，然后连接显示器，键盘，鼠标并重新上电，输入刚才设置的密码，即可进入Ubuntu18.04系统。可能需要简单配置一下。配置完就会重启。
  
      ![image-20260728113913074](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728113913828.webp)

## b. 硬盘操作

### i. 挂载 SSD固态硬盘

1. 将Jetson Xavier NX 关机断开电源，M.2固态硬盘插座在底部。给Jetson Xavier NX 上电开机，此时df -h 检查硬盘信息可能无法识别到硬盘，所以需要对硬盘进行格式化并挂载到系统上。

   ![image-20260728114746409](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728114746952.webp)

   `这里省略了远程控制工具Nomachine的安装与使用、WiFi的连接。安装Nomachine是为了方便操作。`

2. 打开Jetson Xavier NX 系统自带的磁盘分区工具`Disks`。选择我们接入的M.2 固态硬盘，这里注意不能选择错误，否则会造成系统奔溃。然后按快捷键`Ctrl+F`或者打开右上角的三条横杠，选择Format Disk。

   ![image-20260728114816343](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728114816679.webp)

3. 依然选择M.2 固态硬盘，点击'Create Disk Image'创建硬盘分区。下面的图片没有保留16GB的空闲空间，但是很多博主都说最好留出来16GB的Free Space Following，最后实际操作中我也是留出来了16GB。

   填入磁盘名称，这里以**SSD128** 为例，磁盘的格式必须选择**Ext4**。然后点击**Create** 创建。

   `点击拨号键`，就可以看到已经挂载到系统上。同时**拨号键会自动变成停止键**。

   再次在终端输入 `df -h` 就可以查到刚刚挂载的硬盘了。

   ![image-20260728114907101](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728114907587.webp)

### ii. 移动系统到固态硬盘

```bash
# 1. 打开NX 的终端，在用户目录下输入以下代码
git clone https://github.com/jetsonhacks/rootOnNVMe.git

# 2. 进入 rootOnNVME 目录
cd rootOnNVMe/

# 3. 输入以下命令复制文件到 M.2 固态硬盘。
./copy-rootfs-ssd.sh

# 4. 输入以下命令启动服务，运行后输入NX 的密码，按回车键确认。
./setup-service.sh

# 5. 输入以下命令重启系统。
sudo reboot
```

![image-20260728115137791](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728115137972.webp)

然后输入 `df -h` ,可以看到 eMMC中的文件就全部都复制到了SSD固态硬盘中了，注意以上操作只是复制内容，eMMC中仍然是有系统的，但是系统会默认从SSD中启动，所以不影响。

![image-20260728115200391](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728115200529.webp)

## c. 烧录 Jetson SDK

做完以上工作就可以开始烧录 **Jetson SDK Components**，注意这里要在 Jetson Xavier NX 开机的状态下进行，`不要插跳线帽，不要插跳线帽，不要插跳线帽（重要的事情说三遍）`，**使用 microUSB 数据线连接 Jetson Xavier NX和电脑**。这里有需要的可以选择上DeepStream，当然不选后期用到的时候也可以再安装。烧录Jetson SDK Components的过程和Jetson OS的过程大致相同。

![image-20260728115251543](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728115251943.webp)

因为之前已经烧录过Jetson OS，所以这里取消勾选

![image-20260728115318319](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728115318692.webp)

点击CONTINUE，输入管理员密码进入下一步。第三步会先下载再安装，下载的时候应该会有出现部分SDK下载失败，原因是这些东西都在国外，想要下载的话需要挂梯子，这个大家根据自己的情况去选择合适的软件就行。进入第三步会出现下面的界面，这里输入之前设置的用户名和密码后点击Install。

![image-20260728115347196](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728115347558.webp)

最后会显示下图，点击FINISH AND EXIT完成安装。

![image-20260728115440401](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728115440770.webp)



![img](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728115451431.gif)

----



# 2. 优化

**`参考网址：`**[Jetson Xavier NX配置全过程——安装jtop和OpenCV4.5.3（二）_卸载jetson-stats-CSDN博客](https://blog.csdn.net/weixin_47606814/article/details/127903930)

通过Jetson SDK Components安装的OpenCV 4.1.1版本是不带 CUDA 加速的，无法充分利用 NX 的 GPU 性能，所以先卸载OpenCV 4.1.1后再安装OpenCV 4.5.3。

## a. 安装 jtop

jtop工具在查看jetson边缘计算产品的cpu，gpu,以及内存使用率时非常方便，而且还能查看cuda,cudnn，opencv等相关工具的详细版本号，基本是使用jetson边缘计算产品必装的工具。

```bash
sudo apt install python3-pip
sudo -H pip3 install jetson-stats
sudo systemctl restart jetson_stats.service
```

**安装后重启**，即可以使用。

```bash
sudo jtop
```

## b. 卸载 OpenCV

```bash
sudo apt purge libopencv*
sudo apt autoremove
sudo apt update
```

## c. 安装 OpenCV 4.5.3

### i. 安装依赖库

```bash
sudo apt install -y build-essential checkinstall cmake pkg-config yasm git gfortran
sudo apt install -y libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev
sudo apt install -y libjpeg8-dev libjasper-dev libpng12-dev libtiff5-dev libavcodec-dev libavformat-dev libswscale-dev libxine2-dev libv4l-dev
sudo apt install -y libgtk2.0-dev libtbb-dev libatlas-base-dev libfaac-dev libmp3lame-dev libtheora-dev libvorbis-dev libxvidcore-dev libopencore-amrnb-dev libopencore-amrwb-dev x264 v4l-utils
sudo apt install -y python-dev python-numpy libtbb2 libjpeg-dev libpng-dev libtiff-dev libdc1394-22-dev
sudo apt update
```

`sudo apt install -y libjpeg8-dev libjasper-dev libpng12-dev libtiff5-dev libavcodec-dev libavformat-dev libswscale-dev libxine2-dev libv4l-dev`命令会执行出错，这时候我们换源即可解决问题。

### ii. 更换国内源

将以前的源备份一下，以防以后可以用的。

```bash
sudo cp /etc/apt/sources.list /etc/apt/sources_init.list
```

使用gedit打开文档。

```bash
sudo gedit /etc/apt/sources.list
```

将下边的清华源复制进去，然后点击保存关闭。

```bash
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-updates main restricted universe multiverse
deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-updates main restricted universe multiverse
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-security main restricted universe multiverse
deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-security main restricted universe multiverse
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-backports main restricted universe multiverse
deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-backports main restricted universe multiverse
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic main universe restricted
deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic main universe restricted

deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ xenial main multiverse restricted universe
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ xenial-security main multiverse restricted universe
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ xenial-updates main multiverse restricted universe
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ xenial-backports main multiverse restricted universe
deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ xenial main multiverse restricted universe
deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ xenial-security main multiverse restricted universe
deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ xenial-updates main multiverse restricted universe
deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ xenial-backports main multiverse restricted universe
```

更新软件列表。

```bash
sudo apt update
```

### iii. 下载 OpenCV 和 opencv_contrib 源码

#### 1. 源码下载

分别前往[ OpenCV](https://github.com/opencv/opencv/releases) 和 [opencv_contrib](https://github.com/opencv/opencv_contrib/tags) 的 github 仓库下载源码,注意 OpenCV 和 opencv_contrib 的版本要对应正确。

#### 2. 编译/安装

`将 opencv-4.5.3.zip 和 opencv_contrib-4.5.3.zip 放在同一文件夹（很重要）`

```bash
cd opencv-4.5.3
mkdir build
cd build
```

执行`cmake .. `

```bash
cmake \
-DCMAKE_BUILD_TYPE=Release \
-DCMAKE_INSTALL_PREFIX=/usr/local \
-DOPENCV_ENABLE_NONFREE=1 \
-DBUILD_opencv_python2=1 \
-DBUILD_opencv_python3=1 \
-DWITH_FFMPEG=1 \
-DCUDA_TOOLKIT_ROOT_DIR=/usr/local/cuda \
-DCUDA_ARCH_BIN=7.2 \
-DCUDA_ARCH_PTX=7.2 \
-DWITH_CUDA=1 \
-DENABLE_FAST_MATH=1 \
-DCUDA_FAST_MATH=1 \
-DWITH_CUBLAS=1 \
-DOPENCV_GENERATE_PKGCONFIG=1 \
-DOPENCV_EXTRA_MODULES_PATH=../opencv_contrib-4.5.3/modules \
..
```

进行 make，然后等待2~3个小时

```bash
make -j4 # 四线程编译
```

make编译完成后，进行安装

```bash
sudo make install
```

#### 3. 检验

```bash
python 或 python3
import cv2
cv2.__version__
```

打印出本次安装版本号即安装正确。

![img](https://vip.123pan.cn/1831996731/a_PicBed/project/hornet-base/20260728115945032.gif)



---







































