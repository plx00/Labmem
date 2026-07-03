---
title: ROS1 | ROS2 安装
published: 2026-06-25
updated: 2026-06-25
description: ROS1/2的安装、配置、验证
image: /assets/bolg_cover/ros-install.webp
tags: [ROS1, ROS2, 快速体验]
category: ros
draft: false
author: larry
password: ""
passwordHint: ""
---

---
# 前言
>把ROS1/2的安装过程整合到了一起



# 1. ROS1

Ubuntu20.04操作系统下实施

## a. 一键安装（推荐）

鱼香ros大佬制作的工具，可以一键安装少走弯路，[小鱼的一键安装系列](https://fishros.org.cn/forum/topic/20/%E5%B0%8F%E9%B1%BC%E7%9A%84%E4%B8%80%E9%94%AE%E5%AE%89%E8%A3%85%E7%B3%BB%E5%88%97?lang=zh-CN)

```bash
wget http://fishros.com/install -O fishros && . fishros
```

直接鱼香ROS进行安装，使用以下命令，然后依次选择

- **[1]：** 一键安装(推荐):ROS(支持ROS/ROS2,树莓派Jetson)
- **[1]：** 更换系统源再继续安装
- **[2]：** 更换系统源并清理第三方源
- **[3]：** noetic(ROS1)
- **[1]：** noetic(ROS1)桌面版

## b. 常规安装

**待验证**

1. **设置sources.list**
   ```bash
   sudo sh -c 'echo "deb http://packages.ros.org/ros/ubuntu $(lsb_release -sc) main" > /etc/apt/sources.list.d/ros-latest.list'
   ```
2. **下载安装源**
   ```bash
   sudo sh -c '. /etc/lsb-release && echo "deb http://mirrors.tuna.tsinghua.edu.cn/ros/ubuntu/ `lsb_release -cs` main" > /etc/apt/sources.list.d/ros-latest.list'
   ```
3. **设置密钥**
   ```bash
   sudo apt-key adv --keyserver 'hkp://keyserver.ubuntu.com:80' --recv-key C1CF6E31E6BADE8868B172B4F42ED6FBAB17C654
   ```
    ![1774881343302-591b0152-fd19-4951-8e92-ecf3fe11c401](https://vip.123pan.cn/1831996731/a_PicBed/ros/ros-install/20260625161908273.webp)
4. **更新软件列表**

   ```bash
   sudo apt-get update
   ```
   
5. **安装ROS完整版**
   ```bash
   sudo apt-get install ros-melodic-desktop-full
   ```
6. **安装完成后初始化rosdep**
   ```bash
   sudo apt install python-rosdep2
   sudo rosdep init
   rosdep update
   ```
7. **环境配置**
   ```bash
   $ echo "source /opt/ros/melodic/setup.bash" >> ~/.bashrc
   $ source ~/.bashrc
   ```
8. **构建工厂依赖**
   ```bash
   sudo apt-get install python-rosinstall python-rosinstall-generator python-wstool build-essential
   ```

## c. bashrc

![1774881343375-bf8e3118-e0ad-4d9f-8191-1270a779c7f9](https://vip.123pan.cn/1831996731/a_PicBed/ros/ros-install/20260625162115047.webp)

## d. 成功演示

```bash
# 1. 启动 roscore
roscore 
# 2. 打开乌龟节点
rosrun turtlesim turtlesim_node
# 3. 控制运动
rosrun turtlesim turtle_teleop_key
```

![1774881343440-966e4c88-976a-4185-889d-a05f263f71da](https://vip.123pan.cn/1831996731/a_PicBed/ros/ros-install/20260625162216756.webp)
# 2. ROS2

Ubuntu22.04操作系统下实施

## a. 一键安装（推荐）

使用鱼香ROS大佬的工具，可一键安装，省时省力。

```bash
wget http://fishros.com/install -O fishros && . fishros
```

然后依次选择：

- **[1]：** 一键安装（推荐）——ROS（支持 ROS/ROS2，树莓派/Jetson）
- **[1]：** 更换系统源再继续安装
- **[2]：** 更换系统源并清理第三方源
- **[1]：** humble（ROS2）
- **[1]：** humble（ROS2）桌面版

## b. 常规安装

**待验证** 手动安装 ROS2 Humble,以下步骤适用于 **Ubuntu 22.04 + ROS2 Humble**。请按顺序执行，若遇网络问题可替换为国内镜像源（如清华源）。

1. **设置编码（确保 UTF-8）**

   ```bash
   sudo apt update && sudo apt install locales
   sudo locale-gen en_US en_US.UTF-8
   sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
   export LANG=en_US.UTF-8
   ```

2. 添加 ROS2 软件源（清华镜像源，速度更快）

   ```bash
   # 启用 Ubuntu Universe 仓库
   sudo apt install software-properties-common
   sudo add-apt-repository universe
   
   # 添加 ROS2 GPG 密钥
   sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
   
   # 添加软件源（使用清华镜像）
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] https://mirrors.tuna.tsinghua.edu.cn/ros2/ubuntu $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
   ```

3. **更新软件列表并安装 ROS2 桌面版**

   ```bash
   sudo apt update
   sudo apt upgrade   # 可选，建议更新已装软件
   sudo apt install ros-humble-desktop
   ```

4. **安装 rosdep（ROS2 依赖管理工具）**

   ```bash
   sudo apt install python3-rosdep
   sudo rosdep init
   rosdep update
   ```

   若 `rosdep init` 因网络问题失败，可参考鱼香ROS的 `rosdepc` 工具解决。

5. **配置环境变量（自动加载）**

   ```bash
   echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
   source ~/.bashrc
   ```

6. **安装构建工具（colcon 等）**

   ```bash
   sudo apt install python3-colcon-common-extensions
   sudo apt install python3-rosinstall python3-rosinstall-generator python3-wstool build-essential
   ```

7. **验证安装（可选）**

   ```bash
   # 运行一个简单的 C++ talker 节点
   ros2 run demo_nodes_cpp talker
   ```

   如果看到 `[INFO] [xxx]: Publishing: 'Hello World: xxx'` 则说明安装成功。

## c. bashrc

**待验证** 如果你需要同时使用 ROS1 和 ROS2，或者经常切换不同的 ROS2 版本，建议在 ~/.bashrc 中写一个切换函数，例如：

```bash
alias humble='source /opt/ros/humble/setup.bash'
alias foxy='source /opt/ros/foxy/setup.bash'
```

使用时直接输入 humble 即可切换。

## d. 成功演示

ROS2 中 turtlesim 仍然存在，演示步骤如下（需要开三个终端）：

```bash
# 终端1 —— 启动节点管理器（ROS2 中没有 roscore，但需要先启动一个节点）
ros2 run turtlesim turtlesim_node

# 终端2 —— 启动键盘控制节点
ros2 run turtlesim turtle_teleop_key

# 终端3 —— 查看节点列表
ros2 node list

# 此时用终端2的方向键即可控制小乌龟移动。


# 若需要查看话题信息，可以使用
ros2 topic list
ros2 topic echo /turtle1/cmd_vel
```

# 3. ROS2 演示

## a.资料

相关学习资料链接

|            |                         赵虚左 ROS2                          |                                                              |
| :--------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
|    代码    | [muziing/ROS2_Learning](https://github.com/muziing/ROS2_Learning) | [备份-ROS2_Learning-main.zip](https://1831996731.share.123pan.cn/123pan/wdzVjv-NApyv) |
|    文档    | [Rechardluxry/ROS2_Tuition](https://github.com/Rechardluxry/ROS2_Tuition) | [备份-ROS2_Tuition-main.zip](https://1831996731.share.123pan.cn/123pan/wdzVjv-KB7yv) |
| 文档网页版 | [1.1 ROS2简介 · GitBook](https://rzl6.github.io/ROS2_Tuition/chapter1/11-ros2jian-jie.html) |                                                              |
|    视频    | [ROS2理论与实践](https://www.bilibili.com/video/BV1VB4y137ys/?spm_id_from=333.337.search-card.all.click&vd_source=44174cb9e1b481198e2339e3ef279079) |                                                              |

|              |                          鱼香 ROS2                           |
| ------------ | :----------------------------------------------------------: |
| 视频         | [《ROS 2机器人开发》](https://www.bilibili.com/video/BV1tE4m1d7Ug/?spm_id_from=333.788.videopod.sections&vd_source=44174cb9e1b481198e2339e3ef279079) |
| 代码         | [鱼香ROS/ros2bookcode: ROS 2 书籍代码](https://gitee.com/ohhuo/ros2bookcode)<br />[《ROS 2机器人开发：从入门到实践》 书籍配套代码](https://github.com/fishros/ros2bookcode) |
| ROS2中文文档 | [ROS 2 文档 — ROS 2 Documentation: Humble 文档](http://fishros.org/doc/ros2/humble/) |
| Nav2中文文档 | [Nav2 — Navigation 2 1.0.0 文档](http://fishros.org/doc/nav2) |

## b. 快速体验

### i. HelloWorld（C++）

```bash
ros2 pkg create pkg01_helloworld_cpp --build-type ament_cmake --dependencies rclcpp --node-name helloworld

ros2 pkg create      = 创建功能包
pkg01_helloworld_cpp = 包名
--build-type ament_cmake = C++ 编译方式
--dependencies rclcpp    = 依赖 C++ 核心库
--node-name helloworld  = 自动生成节点代码
```

- **ros2 pkg create**
  - 作用：ROS2 官方命令 → 创建一个新的功能包（package）
  - 可以理解成：“帮我新建一个 ROS2 程序文件夹”
  - 它会自动生成 CMakeLists.txt、package.xml、src 等标准结构
- **pkg01_helloworld_cpp**
  - 自定义的功能包名字
- **--build-type ament_cmake**
  - --build-type：指定编译类型
  - ament_cmake：用于 C++ 程序的编译系统
  - 如果是 Python，就要写 ament_python
  - 一句话：要写 C++ 程序，用 cmake 编译
- **--dependencies rclcpp**
  - --dependencies：声明依赖（需要依靠什么库才能跑）
  - rclcpp：ROS2 C++ 核心接口
    - 所有 C++ 节点都必须依赖它
  - 作用：自动在 package.xml 和 CMakeLists.txt 里加上依赖配置，不用手动改文件
- **--node-name helloworld**
  - --node-name：自动生成一个可执行节点（node）
  - helloworld：节点名字
  - 效果：
    - 自动生成 src/helloworld.cpp
    - 自动写好最基础的 ROS2 节点代码
    - 自动配置好编译规则

### ii. HelloWorld（Python）

```bash
ros2 pkg create pkg02_helloworld_py --build-type ament_python --dependencies rclpy --node-name helloworld

ros2 pkg create             创建包
pkg02_helloworld_py         包名
--build-type ament_python   Python 编译方式
--dependencies rclpy        依赖 Python 核心库
--node-name helloworld      自动生成 helloworld 节点代码
```

- **ros2 pkg create**
  - 作用：创建一个 ROS2 功能包（package）
  - 等于：新建一个 ROS2 程序文件夹
  - 自动生成标准目录结构
- **pkg02_helloworld_py**
  - 功能包名字
- **--build-type ament_python**
  - --build-type：指定编译类型
  - ament_python：Python 程序专用编译方式
  - 对比：
    - C++ → ament_cmake
    - Python → ament_python
- **--dependencies rclpy**
  - --dependencies：声明依赖库
  - rclpy：ROS2 Python 核心接口
    - 所有 Python 节点必须依赖它
  - 作用：自动帮你写好配置文件，不用手动改
- **--node-name helloworld**
  - 自动生成一个Python 节点模板
  - 名字叫 helloworld
  - 效果：
    - 自动生成 package_name/helloworld.py
    - 自动写好最简可运行代码
    - 自动配置运行入口

|  类型  |                      命令关键不同                      |
| :----: | :----------------------------------------------------: |
|  C++   | `--build-type ament_cmake`<br/>`--dependencies rclcpp` |
| Python | `--build-type ament_python`<br/>`--dependencies rclpy` |

## c. 运行优化

每次终端中执行工作空间下的节点时，都需要调用 `. install/setup.bash` 指令，使用不便，优化策略是，可以将该指令的调用添加进 `~/setup.bash`，操作格式如下：

```bash
echo "source /{工作空间路径}/install/setup.bash" >> ~/.bashrc
```

示例：

```bash
echo "source ~/ros2/ws00_helloworld/install/setup.bash" >> ~/.bashrc
```

以后再启动终端时，无需手动再手动刷新环境变量，使用更方便。



---
