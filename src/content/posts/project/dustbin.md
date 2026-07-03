---
title: 智能垃圾桶-摄像头版
published: 2024-09-10
updated: 2026-06-30
description: 智能垃圾桶-摄像头版相关使用与布置
image: /assets/bolg_cover/dustbin.webp
tags: [垃圾桶, 摄像头, Yolo5]
category: 项目
draft: false
author: larry
password: ""
passwordHint: ""
---

---

# 前言

> 这套相关文档留存已久，我最早 22 年便接触该项目，23 年完成文档；但现有文件属性显示最早修改记录为 24 年 9 月，原版素材大概率存放在另一块硬盘中，目前暂时无法溯源，暂且不做深究。

> 在jetson nano上部署yolov3或yolov5所需要的环境，来运行摄像头-垃圾桶识物代码

> 这个是摄像头拍照识别垃圾的**识物版垃圾桶**配置文件，其中应该有一些不对，但是不整理了，以后如果在弄这个识物版垃圾桶的时候在参考这个吧！使用平台 `Jetson Nano` + `Stm32` + `语音模块`

# 1. 软件

## a. 烧录镜像

1. **下载镜像**

   - 英伟达官方地址：[jetson-nano-sd-r32.1-2019-03-18.zip](https://developer.nvidia.com/embedded/dlc/jetson-nano-dev-kit-sd-card-image)

     这个是一个博主给的网址，下载文件的名称为 `jetson-nano-sd-r32.1-2019-03-18.zip`，可以看出是2019年的
     
   - 自行下载

     可以自行下载对应的jetson nano镜像，第二个就是 jetson nano 4GB，第一个是 Jetson Xavier NX ，第三个是 Jetson Nano 2GB

     [杰特森下载中心|英伟达开发者 (nvidia.com)](https://developer.nvidia.com/embedded/downloads)

     ![1774878993947-860dd405-02e8-4dc5-b462-d00e7709185f](https://vip.123pan.cn/1831996731/a_PicBed/project/dustbin/20260630161034746.webp)

     我自己下的是 2020年 的好像，问题不大，链接地址：https://pan.quark.cn/s/c06b11f91ad6

2. **格式化TF卡**

   ![1774878994053-f8aeed72-afbb-4a77-bdcc-975cee1fd8da](https://vip.123pan.cn/1831996731/a_PicBed/project/dustbin/20260630161336941.webp)

3. **Win32写入镜像**
   ```ini
   1-找到镜像文件选择
   2-选择要烧录的镜像
   3-烧录
   ```

   ![1774878994148-c4f34ea8-28f1-4555-837f-bde7f1af67b8](https://vip.123pan.cn/1831996731/a_PicBed/project/dustbin/20260630161519261.webp)

4. **插卡！开机！**

5. **开启root用户**

   ```bash
   # 之后的很多命令需要用到root权限，我们需要开启root用户
   sudo passwd root
   ```
## b.相关配置

- **更换系统源**

  ```bash
  sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak
  sudo gedit /etc/apt/sources.list
  
  # 删除 /etc/apt/sources.list 中所有内容，更换成下面的
  deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic main multiverse restricted universe
  deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-security main multiverse restricted universe
  deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-updates main multiverse restricted universe
  deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-backports main multiverse restricted universe
  deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic main multiverse restricted universe
  deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-security main multiverse restricted universe
  deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-updates main multiverse restricted universe
  deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ bionic-backports main mul
  ```
  或者直接使用鱼香ROS的代码 ，来进行更换系统源的操作
  ```
  wget http://fishros.com/install -O fishros && . fishros
  ```
- **配置 CUDA**

  jetson nano 内置好了 cuda,但需要配置环境变量才能使用
  ```bash
  # 打开.bashrc文件
  gedit ~/.bashrc
  
  # 在最后添加
  export PATH=/usr/local/cuda-10.2/bin${PATH:+:${PATH}}
  export LD_LIBRARY_PATH=/usr/local/cuda-10.2/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}
  export CUDA_ROOT=/usr/local/cuda
  
  # 应用当前配置
  source ~/.bashrc
  
  # 查看是否配置成功
  nvcc -V
  ```
- **安装pip3**
  ```bash
  sudo apt-get update
  sudo apt-get install python3-pip python3-dev -y
  ```
- **安装jtop(可选)**

  安装jtop库这个可以监控自己的设备cpugpu工作状态
  ```bash
  sudo -H pip3 install jetson-stats
  
  # 运行jtop（第一次可能不行，第二次就好了）
  sudo jtop		
  # 按【q】退出
  ```
- **配置需要用到的库**
  ```bash
  sudo apt-get install build-essential make cmake cmake-curses-gui -y
  sudo apt-get install git g++ pkg-config curl -y
  sudo apt-get install libatlas-base-dev gfortran libcanberra-gtk-module libcanberra-gtk3-module -y
  sudo apt-get install libhdf5-serial-dev hdf5-tools -y
  sudo apt-get install nano locate screen -y
  ```
- **安装所需要的依赖环境**
  ```bash
  sudo apt-get install libfreetype6-dev -y
  sudo apt-get install protobuf-compiler libprotobuf-dev openssl -y
  sudo apt-get install libssl-dev libcurl4-openssl-dev -y
  sudo apt-get install cython3 -y
  ```
- **安装opencv的系统级依赖,一些编解码的库**
  
  ```bash
  sudo apt-get install build-essential -y
  sudo apt-get install cmake git libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev -y
  sudo apt-get install python-dev python-numpy libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff5-dev libdc1394-22-dev -y
  sudo apt-get install libavcodec-dev libavformat-dev libswscale-dev libv4l-dev liblapacke-dev -y
  sudo apt-get install libxvidcore-dev libx264-dev -y
  sudo apt-get install libatlas-base-dev gfortran -y
  sudo apt-get install ffmpeg -y
  ```
- **更新CMake**
  ```bash
  # 这一步是必须的，因为arm架构的很多东西都要从源码编译（但是我没弄，时间太长了）
  
  wget http://www.cmake.org/files/v3.13/cmake-3.13.0.tar.gz
  tar xpvf cmake-3.13.0.tar.gz cmake-3.13.0/  #解压
  cd cmake-3.13.0/
  ./bootstrap --system-curl	# 漫长的等待,做一套眼保健操...
  make -j4 					#编译  同样是漫长的等待...
  echo 'export PATH=~/cmake-3.13.0/bin/:$PATH' >> ~/.bashrc
  source ~/.bashrc #更新.bashrc
  ```
- **U盘兼容**
  ```bash
  #之后的步骤可能需要使用U盘把文件拷入开发板，但是对于大容量设备可能会出现无法挂载，一条安装命令解决
  sudo apt-get install exfat-utils
  
  # (这个问题我未出现)
  ```


## c. 安装pytorch

**jetson nano上的linux其实不是x86架构而是类似手机的ARM架构**

### **i. 下载pytorch1.8**

- Nvidia官方链接
  ```http
  https://forums.developer.nvidia.com/t/pytorch-for-jetson-version-1-9-0-now-available/72048
  ```
- 选择对应的python版本与pytorch版本
  - pytorch链接：https://pan.quark.cn/s/7d285f8cf84e
  - 其中的torch-1.8.0-cp36-cp36m-linux_aarch64.whl就是

### **ii. 安装pytorch1.8**

把下载的包拷到开发板上，建议放桌面上，安装完就可以删了

```bash
# 直接把.whl拖到命令窗口中，让它自动填充文件位置
sudo pip3 install ***.whl
```

![1774878994212-dc68ffb9-c239-4ccf-8d84-080da275cce9](https://vip.123pan.cn/1831996731/a_PicBed/project/dustbin/20260630163158152.webp)

## d. 安装torchvision

pytorch和torchvision版本是需要对应的！

**1. 需要的依赖**

```bash
sudo apt-get install libopenmpi2
sudo apt-get install libopenblas-dev
sudo apt-get install libjpeg-dev zlib1g-dev
```

**2. 安装**

> 这一段应该有错误，在复现时应该勘查一下

```bash
# 同样需要特殊的匹配jetson nano的版本
# 下载地址是外网…
git clone --branch v0.7.0 https://github.com/pytorch/vision torchvision
```


上一步没成功的话不要紧，步骤【三】中我的个人链接里包含了这个torchvision
把下载的包拷到开发板上，同样建议放桌面上，安装完就可以删了

```bash
cd torchvision	# 进入到这个包的目录下
export BUILD_VERSION=0.9.0
sudo python3 setup.py install		# 安装（估计要20分钟不止吧）
```

**3. 检验一下是否成功安装**

```bash
python3
import torch
import torchvision
print(torch.cuda.is_available())	# 这一步如果输出True那么就成功了！
quit()	# 最后退出python编译
```

![1774878994272-03284527-b5e4-44e0-89b2-965b4596ed19](https://vip.123pan.cn/1831996731/a_PicBed/project/dustbin/20260630163636087.webp)

## e. 增加Swap

这一步是必须的，显存个内存是共享受的，物理内存只有4G,所以个人感觉加上好一些。Swap交换空间是在硬盘上，当物理内存RAM用完时，会开始使用。交换空间可以采用专用交换分区或交换文件的形式。在大多数情况下，不存在交换分区，因此唯一的选择是创建交换文件。创建教程参考1和参考2该链接，将添加swap file到ubuntu 18.04系统上。

- **检查当前系统的效换空间**
  ```bash
  sudo swapon --show
  ```

  ![1774878994333-b6d850c4-fbaa-4ea6-bc66-1ae7a948df85](https://vip.123pan.cn/1831996731/a_PicBed/project/dustbin/20260630163830540.webp)
- **检查内存**
  ```bash
  free -h
  # 内存有4G,交换空间2G
  ```

  ![1774878994437-ed8d2b99-4c5e-4254-aee9-38b9b9e78c44](https://vip.123pan.cn/1831996731/a_PicBed/project/dustbin/20260630163906400.webp)
- **增加2G交换空间**
  1. 创建swap的文件
     ```bash
     sudo fallocate -l 8G /swapfile
     
     # 如果fallocate没有安装，将得到fallocate failed:Operation not supported的报错信息。可以用以下命令创建
     sudo dd if=/dev/zero of=/swapfile bs=2048 count=1048576
     ```
  2. 所有用户都可以读写swap file,设置正确的权限
     ```bash
     sudo chmod 666 /swapfile
     ```
  3. 设置交换空间
     ```bash
     sudo mkswap /swapfile
     ```
  4. 激活交换空间
     ```bash
     sudo swapon /swapfile
     
     # 为了使这个激活永久有效
     sudo vi /etc/fstab
     # 粘贴 /swapfile swap swap defaults 0 0 到文件在
     ```

     ![1774878994516-3f828cbb-71a6-4904-b109-8b1a4da78ee1](https://vip.123pan.cn/1831996731/a_PicBed/project/dustbin/20260630164140115.webp)
  5. 验证增加空间是否有效
     ```bash
     sudo swapon --show
     sudo free -h
     ```

[grid]
![1774878994592-9c17ed87-40d9-42c4-854b-efe60e03a42b](https://vip.123pan.cn/1831996731/a_PicBed/project/dustbin/20260630164243296.webp) 
![1774878994662-f9eaf91a-a2b4-49c4-ab1a-93d6a412d3f8](https://vip.123pan.cn/1831996731/a_PicBed/project/dustbin/20260630164251208.webp)
[/grid]

## f. 切换高低功率

有两种供电方式，10W和5W。

```bash
#查看当前是那个模式
sudo nvpmodel -q
```

![1774878994720-0256f250-4e65-428f-ac80-51151e3e8e1b](https://vip.123pan.cn/1831996731/a_PicBed/project/dustbin/20260630164659425.webp)

```bash
# 将当前模式切换到5W模式,将会自动关掉两个cpu,只使用cpu1,2
sudo nvpmodel -m 1
```

两种模式，0 是高功率10w,1是低功率5w,默认状态是高功率。安装时，切换到最大功率，因为安装时会用到许多外设，耗电量大，在执行完功率状态切换后往往还要加一行：

```bash
sudo nvpmodel -m 0
sudo jetson_clocks
```

jetson_clocks将会使cpu频率固定。另外nano有两种供电方式，一种是5V 2.5A(10W)的microUSB供电；但如果你要有很多外设在（键盘、鼠标、wifi、显示器）在使用，最好用5V 4A(20W)的供电方式，来保证nano的正常工作。

## g. 将垃圾桶识物代码下到主目录

> 暂时放在夸克，如果以后要复现，在统一放到123来

链接：https://pan.quark.cn/s/1624292098ca

其中的dustbin就是识物的代码，剩下两个是测试的官方文件

## h. 安装yolov5需要的包

### i. 网络下载失败解决办法

执行 pip 安装命令时若因外网网络超时失败，可在命令末尾追加清华镜像源参数加速：

```bash
-i https://pypi.tuna.tsinghua.edu.cn/simple 
```

也可配置全局镜像源一劳永逸，操作如下：

1. 升级 pip /pip3
  ```bash
  # 升级系统默认 pip
  python -m pip install --upgrade pip
  
  # 升级 Python3 专用 pip3
  python3 -m pip install --upgrade pip
  ```
2. pip 永久国内镜像源配置
  ```bash
  # 1）在用户根目录创建隐藏配置文件夹
  mkdir ~/.pip
  
  # 2）进入文件夹并新建配置文件
  cd ~/.pip && touch pip.conf
  
  # 3）写入豆瓣镜像源配置内容
  [global]
  index-url = http://pypi.douban.com/simple
  [install]
  use-mirrors =true
  mirrors =http://pypi.douban.com/simple/
  trusted-host =pypi.douban.com
  ```
3. 常用国内 pip 镜像源清单
   - 清华源：https://pypi.tuna.tsinghua.edu.cn/simple/
   - 豆瓣源：http://pypi.douban.com/simple/
   - 阿里云源：http://mirrors.aliyun.com/pypi/simple/
   - 中科大源：http://pypi.mirrors.ustc.edu.cn/simple/
   - 华科源：http://pypi.hustunique.com/

### ii. 基础第三方库

```bash
# 1. 基础依赖包
sudo pip3 install matplotlib==3.2.2
sudo pip3 install --upgrade Cython

# 2. Numpy & Scipy（特殊处理）
#Jetson Nano 系统预装 apt 版本 numpy，容易引发版本冲突，需先卸载系统自带包，再指定低版本重装
# 卸载系统预装numpy
sudo apt-get remove python-numpy
# 安装适配低版本numpy、scipy
sudo pip3 install numpy==1.18.5
sudo pip3 install scipy==1.4.1
# scipy编译安装耗时较长，耐心等待

# 3. 视觉、数据处理配套库
sudo pip3 install tqdm==4.61.2
sudo pip3 install seaborn==0.11.1
# OpenCV编译前置依赖
sudo pip3 install scikit-build==0.11.1
# opencv-python最低适配4.3.0版本，安装耗时久
sudo pip3 install opencv-python==4.3.0
# 带清华源加速安装tensorboard
sudo pip3 install tensorboard==2.5.0 -i https://pypi.tuna.tsinghua.edu.cn/simple
# PyYAML版本升级/指定安装二选一
sudo pip3 install --upgrade PyYAML
# sudo pip3 install PyYAML==5.4.1
sudo pip3 install thop
sudo pip3 install pycocotools==2.0

# 4. PIL 图像处理包（pillow）
# Jetson Nano 原生无 PIL 库，重装指定稳定版本：
sudo pip3 uninstall pillow
# 推荐安装8.4.0稳定版
sudo pip3 install pillow==8.4.0

# 5. 项目通信、web 工具包（Python3.7 专用）
# 下载失败不影响项目基础运行，可选择性安装
pip3.7 install serial
pip3.7 install flask
pip3.7 install flask_cors
pip3.7 install gevent
pip3.7 install pafy
pip3.7 install netron

# 6. 模型转换、推理相关工具包
# ONNX：通用机器学习模型存储格式
sudo pip3 install onnx
# ONNXSIM：ONNX模型轻量化优化工具
sudo pip3 install onnxsim
# CoreMLTools：转换适配苹果设备CoreML模型
sudo pip3 install coremltools
# Google Colab：云端训练环境工具（本地nano可不用）
sudo pip3 install google.colab
```

### iii. 后续&延伸

（摘抄，未实践）

**受限于Jetson nano的性能，yolov5的s模型也只有1秒9帧这样的识别速度，应该说不算差，但是有提升办法的**，**这里也给出传送门**

**1.安装pycuda**

```
https://blog.csdn.net/weixin_44501699/article/details/106470671
```

**2.TensorRT加速**

```
源代码下载地址：
链接：https://pan.baidu.com/s/1SFWCmEHe6cn_uVfig_bJDQ 
提取码：x97q
```

```
https://blog.csdn.net/ailaier/article/details/116270962
#文章里面提到的的DeepStream我没有配置成功...
```

```
https://blog.csdn.net/hahasl555/article/details/116500763

#这位的的代码是有些小问题的，但是他的评论区给出了解决办法————

auto yolo = addYoLoLayer(network, weightMap, det0, det1, det2);
改为
auto yolo = addYoLoLayer(network, weightMap, "model.33", std::vector<IConvolutionLa
```

## i. 开机自启动

英伟达使用的 ubuntu版本应该是介于 16.04与18.04之间，所以添加开机自启动的方式应该还是以16.04 为基准（本镜像使用为这样，不排除以后官方更新这方面的镜像），可以在网上搜索 “ubuntu 16.04怎么设置开机自启动程序” 应该可以有三种方式设置

项目的目录应该放在`/home/` 文件夹下的根目录中 形成的关系应该是` /home/dustbin(自己系统名称)/dustbin(项目名称)`

```bash
#开机自启动文件内容（如果路径不统一，需修改进入路径空间）

#！/bin/bash

cd /home/dustbin/dustbin  #此处根据自己的项目具体放在何处进行路径修改

sleep 10

OPENBLAS_CORETYPE = ARMV8 gnome-terminal -x bash -c "python3 detectwebcam.py"

sleep 50

OPENBLAS_CORETYPE = ARMV8 gnome-terminal -x bash -c "python3 button.py"

done
```

## j. 其他

- **原有程序包中的模型标签与下位机发送的协议对应关系**

  ```python
  def kinds_def(rubbish):
      kinds={
  
          #可回收垃圾
          "1":7070116610,       #旧塑料篮子
          "15":7070116607,      #旧手提包
          "17":7070116627,      #旧玩具
          "19": 7070116632,     #晾衣架
          "20":7070116625,      #旧纸袋
          "23": 7070116604,     #报纸
          "25":7070116611,      #旧玩偶
          "27":7070116603,      #玻璃瓶
          "28":7070116608,      #旧鞋子
          "30": 7070116626,     #纸盒
          "31":7070116601,      #塑料瓶
          "32":7070116603,      #玻璃瓶
          "33":7070116602,      #食品罐头
          "34": 7070116613,     #旧铁锅
          "36": 7070116601,     #塑料瓶
  
          #厨余垃圾
          "7": 1010116612,       #骨头
          "11":1010116601,      #菜叶
          "12": 1010116607,     #鸡蛋壳
          "13": 1010116609,     #鱼骨
          "14":1010116615,      #面包
          "18":1010116621,      #香蕉皮
          "26":1010116628,      #苹果
          "45":1010116614,      #蛋糕
  
          #其他垃圾
          "2":3030116627,       #烟蒂
          "3":3030116629,       #打火机
          "4":3030116621,       #坏花瓶
          "5": 3030116617,      #筷子
          "8":3030116625,       #木梳子
          "10":3030116634,      #牙刷
          "16":3030116613,      #化妆品
          "22":3030116626,      #脏衣服
          "29":3030116609,      #菜板 
  
          #有害垃圾
          "37": 5050116618,     #废电池 
          "39": 5050116605,     #过期药片
  
  
          #其他标签(选择错误,请重新作答)
          "Nothing":1122335566
  
      }
      return kinds.get(rubbish,None)
  ```

- **下位机所有对应协议**

  [智能垃圾桶---垃圾对应文件.xlsx(13.4 KB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-MaQyv)

  `需注意的是，要发送下位机协议并不是 如 10116601这样的，而是需要加上它的种类 应该如 1010116601`

  | 厨余垃圾-10 |          |      | 其他垃圾-30 |          |      | 有害垃圾-50 |          |      | 可回收垃圾-70 |          |
  | ----------- | -------- | ---- | ----------- | -------- | ---- | ----------- | -------- | ---- | ------------- | -------- |
  | 菜叶        | 10116601 |      | 旧浴缸      | 30116601 |      | 酒精        | 50116601 |      | 塑料瓶        | 70116601 |
  | 橙皮        | 10116602 |      | 盘子        | 30116602 |      | 油漆        | 50116602 |      | 食品罐头      | 70116602 |
  | 葱          | 10116603 |      | 坏马桶      | 30116603 |      | 过期胶囊    | 50116603 |      | 玻璃瓶        | 70116603 |
  | 饼干        | 10116604 |      | 旧水槽      | 30116604 |      | 温度计      | 50116604 |      | 易拉罐        | 70116604 |
  | 番茄酱      | 10116605 |      | 贝壳        | 30116605 |      | 过期药片    | 50116605 |      | 报纸          | 70116605 |
  | 西瓜皮      | 10116606 |      | 化妆刷      | 30116606 |      | 荧光灯      | 50116606 |      | 旧书包        | 70116606 |
  | 鸡蛋壳      | 10116607 |      | 坛子        | 30116607 |      | 蓄电池      | 50116607 |      | 旧手提包      | 70116607 |
  | 马铃薯      | 10116608 |      | 海绵        | 30116608 |      | 医用棉签    | 50116608 |      | 旧鞋子        | 70116608 |
  | 鱼骨        | 10116609 |      | 菜板        | 30116609 |      | 医用手套    | 50116609 |      | 牛奶盒        | 70116609 |
  | 甘蔗        | 10116610 |      | 砖块        | 30116610 |      | 杀虫剂      | 50116610 |      | 旧塑料篮子    | 70116610 |
  | 玉米        | 10116611 |      | 卫生纸      | 30116611 |      | 农药瓶      | 50116611 |      | 旧玩偶        | 70116611 |
  | 骨头        | 10116612 |      | 调色板      | 30116612 |      | 废温度计    | 50116612 |      | 玻璃壶        | 70116612 |
  | 虾壳        | 10116613 |      | 化妆品      | 30116613 |      | 医用纱布    | 50116613 |      | 旧铁锅        | 70116613 |
  | 蛋糕        | 10116614 |      | 桃核        | 30116614 |      | 口服液瓶    | 50116614 |      | 垃圾桶        | 70116614 |
  | 面包        | 10116615 |      | 杯子        | 30116615 |      | 消毒剂      | 50116615 |      | 煤气罐        | 70116615 |
  | 草莓        | 10116616 |      | 陶瓷碗      | 30116616 |      | 注射器      | 50116616 |      | 塑料梳子      | 70116616 |
  | 西红柿      | 10116617 |      | 筷子        | 30116617 |      | 漆桶        | 50116617 |      | 旧帽子        | 70116617 |
  | 梨          | 10116618 |      | 瓦片        | 30116618 |      | 废电池      | 50116618 |      | 书            | 70116618 |
  | 蘑菇        | 10116619 |      | 碎花瓶      | 30116619 |      | 创可贴      | 50116619 |      | 香水瓶        | 70116619 |
  | 蟹壳        | 10116620 |      | 西梅核      | 30116620 |      | 录像带      | 50116620 |      | 旧夹子        | 70116620 |
  | 香蕉皮      | 10116621 |      | 坏花盆      | 30116621 |      | 化学器皿    | 50116621 |      | 废锁头        | 70116621 |
  | 辣椒        | 10116622 |      | 扫把        | 30116622 |      | 染发剂壳    | 50116622 |      | 汤勺          | 70116622 |
  | 洋葱        | 10116623 |      | 尿裤        | 30116623 |      | X光片       | 50116623 |      | 篮球          | 70116623 |
  | 花生壳      | 10116624 |      | 水彩笔      | 30116624 |      | 废胶片      | 50116624 |      | 雨伞骨架      | 70116624 |
  | 巧克力      | 10116625 |      | 木梳子      | 30116625 |      | 矿物油      | 50116625 |      | 旧纸袋        | 70116625 |
  | 茄子        | 10116626 |      | 脏衣服      | 30116626 |      | 输液瓶      | 50116626 |      | 纸盒          | 70116626 |
  | 豌豆皮      | 10116627 |      | 烟蒂        | 30116627 |      | 老鼠药      | 50116627 |      | 旧玩具        | 70116627 |
  | 苹果        | 10116628 |      | 渣土        | 30116628 |      | 荧光灯      | 50116628 |      | 螺丝刀        | 70116628 |
  |             |          |      | 打火机      | 30116629 |      |             |          |      | 电路板        | 70116629 |
  |             | 28       |      | 荧光棒      | 30116630 |      |             | 28       |      | 吹风机        | 70116630 |
  |             |          |      | 发胶        | 30116631 |      |             |          |      | 刀具          | 70116631 |
  |             |          |      | 旧镜子      | 30116632 |      |             |          |      | 晾衣架        | 70116632 |
  |             |          |      | 牙膏皮      | 30116633 |      |             |          |      |               |          |
  |             |          |      | 牙刷        | 30116634 |      |             |          |      |               | 32       |
  |             |          |      | 眼镜        | 30116635 |      |             |          |      |               |          |
  |             |          |      | 光盘        | 30116636 |      |             |          |      |               |          |
  |             |          |      |             |          |      |             |          |      |               |          |
  |             |          |      |             | 36       |      |             |          |      |               |          |

# 2. 硬件

[grid]
![1774878994774-f41c411b-10ad-47b5-b963-b44c72bfd961](https://vip.123pan.cn/1831996731/a_PicBed/project/dustbin/20260630155450197.webp)
![1774878994856-6f5a1aee-1d6f-42c3-adb3-bfcce245d363](https://vip.123pan.cn/1831996731/a_PicBed/project/dustbin/20260630155647972.webp)
![1774878994916-028b095d-e887-4f75-8340-f36b90a35033](https://vip.123pan.cn/1831996731/a_PicBed/project/dustbin/20260630155656694.webp)
[/grid]

## a. 按钮线路

> 原话：如上第一张图片所示，按钮连接 在 Stm 32板上连接对应的是 上面引脚对应开关下面管脚，下面引脚对应开关上面管脚，信号线一端接按钮哪一侧都可以，另一端接Jetson nano 板的 12引脚，代表触发时进行拍照。

- 参照第一张示意图完成按键接线：
  - 开关上端管脚，连接 STM32 板对应的上方引脚；
  - 开关下端管脚，连接 STM32 板对应的下方引脚；
- 触发信号线无接入方向限制：
  - 一端可接开关任意一侧管脚；
  - 另一端接入 Jetson Nano 开发板 12 号引脚；
- 功能逻辑：
  - 按下开关触发电平信号，设备自动执行拍照采集。

## b. 信号线线路连接

> 原话：如上第一张图片所示，一共三根线路，GND VCC 信号引脚 这三个连接 ，Stm 32板上需连接 GND与VCC，还有连接信号RX引脚，如上第二张图片所示，最左端的那一排RX都可以。
> 而Jetson nano板 上连接对应的关系是 GND-GND VCC-VCC RX-TX ，所以如上第三张图片所示，右排的4、6、8引脚即对应的是Jetson nano板的VCC GND TX

- 参照第一张示意图，整套接线共包含 3 根线路：
  - GND、VCC、信号引脚
  - STM32 端接线：
    - 分别接入 GND、VCC，以及信号 RX 引脚；第二张图最左侧一排 RX 引脚均可选用
- Jetson Nano 端对应接线规则：
  - GND 对接 GND、VCC 对接 VCC、RX 对接 TX
  - 参照第三张示意图，右侧 4、6、8 引脚依次对应 Jetson Nano 的 VCC、GND、TX

## c. 摄像头线路连接

摄像头是一个USB摄像头，插在Jetson nano板的任意一个USB端口即可

## d. 跳线帽连接

> 原话：Stm 32板 上需要连接 语音播报引脚 如上第二张图片所示， 连接右边的TX-Speed TX ，就可以使用STM 32板上的，语音模块功能了
> Jetson nano J48引脚 若使用引脚连接，则有无跳线帽都可

- STM32 主板语音播报接线：
  - 参照第二张示意图，接入右侧 TX-Speed TX 引脚，即可启用板载语音播报模块功能
- Jetson Nano J48 引脚说明：
  - 采用引脚直连方式通信时，该位置有无跳线帽不影响正常使用

# 3. 错误
在错误前程序的启动顺序为 detactwecame.py为先，然后 buttuy.py
## a. E1
```
OSError: [Errno 12] Cannot allocate memory
```
错误日志没有保存下来，有图片但是在另一个系统中，大致意思就是内存不足，导致detactwecame.py程序在进行按键操作后，会终止运行，解决方法也很简单，**进行第五步操作--增加交换空间大小即可**
## b. E2

这第二个错误日志也没有保存下来，这一个错误是在解决内存问题后，使用xshell6出现的问题，根据错误信息可以知道，是因为在运行程序时，无法打开图形化界面，导致程序终止，这个有很多办法，这里记录一种但管用（使用xshell的前提）

1. **这个方法也很简单，只要安装以下xshell官方的图形化界面如软件即可**

   - 网址：https://www.xshellcn.com/xiazai.html	


   - 这里提供了一个试用版，大概是30天左右,足够进行程序的调试


2. **这种问题解决方法很多，还可以换一种直接远程打开系统的图形化软件，直接操作**

3. **还有可以直接为板子接一块显示屏，直接在显示屏操作，这样操作更加方便，但是接外设的话，可能会导致电流的不够用（但实际用量很小，却有时会不断重启，可能与连接线材质有关系）**

## c. E3

**i2c总线设置有误**





----

