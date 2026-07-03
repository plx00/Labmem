---
title: Unitree 机器狗（一）：运动控制
published: 2026-03-19
updated: 2026-07-02
description: 宇树机器狗 Go2-Air相关的二次开发
image: /assets/bolg_cover/unitree-01.webp
tags: [机器狗, ROS, 自动导航]
category: 项目
draft: false
author: larry
password: ""
passwordHint: ""
---

---

# 前言

**[Unitree 机器狗（二）：ROS导航](/posts/project/unitree-02/)**

>本文档用于记录摩方M6s N100平台下，宇树机器狗Go2 Air版本相关的ROS控制开发、功能测试、联调调试等相关工作，作为项目过程追溯、参数参考、问题排查的基础依据，后续内容可根据实际项目需求补充完善。

- **基础环境**
  | **主机设备**   | 摩方M6s N100                                                 |
  | -------------- | ------------------------------------------------------------ |
  | **操作系统**   | Ubuntu 20.04 LTS                                             |
  | **传感器设备** | 思岚 A1M8                                                    |
  | **ROS版本**    | ROS Noetic Ninjemys                                          |
  | **补充说明**   | 本环境为项目/测试的基础运行环境，后续所有操作均基于此环境开展，若环境有变更，需在文档中同步更新。 |
- **参考链接**
  | **[GitHub - abizovnuralem/go2_ros2_sdk](https://github.com/abizovnuralem/go2_ros2_sdk)** |
  | ------------------------------------------------------------ |
  | **[GitHub - legion1581/unitree_webrtc_connect](https://github.com/legion1581/unitree_webrtc_connect)** |
  | **[GitHub - phospho-app/go2_webrtc_connect](https://github.com/phospho-app/go2_webrtc_connect)** |
  | **[宇树科技 文档中心](https://support.unitree.com/home/zh/developer/Obtain%20SDK)** |
  | **[timer/GO2GO](https://gitee.com/simon_133/go2-go)**        |
  | **[GitHub - legion1581/go2_firmware_tools](https://github.com/legion1581/go2_firmware_tools)** |
  | **[unitree-go2-slam-nav2](https://relatedrepos.com/gh/h-naderi/unitree-go2-slam-nav2)** |
  | **[DarrenPig (darrenpig) - Gitee.com](https://gitee.com/darrenpig)** |

本文件将在上述基础环境的框架下，详细记录项目开发、测试验证等相关工作的进展。各具体模块可根据实际需求灵活规划与补充。鉴于篇幅及内容聚焦考量，有关系统安装及部分常用配置的具体细节将不做赘述。

# 1. unitree_webrtc_connect

> 该仓库包含一个 Python 实现的 WebRTC 驱动，用于连接 Unitree Go2 和 G1 机器人。WebRTC 被 Unitree Go/Unitree Explore 应用使用，并通过它提供高层次控制。因此，无需越狱或固件操作。它开箱即用，适用于Go2 AIR/PRO/EDU型号和G1 AIR/EDU型号。 

- **源码**
  - **官网地址：**[GitHub - legion1581/unitree_webrtc_connect](https://github.com/legion1581/unitree_webrtc_connect)
  - **123备份：**[unitree_webrtc_connect-master.zip(7.92 MB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-zApyv)

## a. 连接方法

- **该驱动程序支持三种连接方式**
  1. **AP模式：** Go2/G1处于AP模式，WebRTC客户端直接连接到它：
     ```python
     UnitreeWebRTCConnection(WebRTCConnectionMethod.LocalAP)
     ```
  2. **STA-L 模式：** Go2/G1 和 WebRTC 客户端在同一局域网络上。需要一个IP或序列号：
     ```python
     UnitreeWebRTCConnection(WebRTCConnectionMethod.LocalSTA, ip="192.168.8.181")
     ```
     如果IP未知，你只需指定序列号，驱动程序会尝试使用Go2上的特殊组播发现功能来查找该IP：
     ```python
     UnitreeWebRTCConnection(WebRTCConnectionMethod.LocalSTA, serialNumber="B42D2000XXXXXXXX")
     ```
  3. **STA-T 模式：** 通过远程 Unitrees TURN 服务器远程连接。即使连接不同的网络，也能控制你的Go2/G1。需要用户名并从Unitree账户获得通行证
     ```python
     UnitreeWebRTCConnection(WebRTCConnectionMethod.Remote, serialNumber="B42D2000XXXXXXXX", username="email@gmail.com", password="pass")
     ```
## b. 安装

  驱动内置多播扫描器，可在局域网中查找Unitree Go2并仅凭序列号连接。

### i. PIP安装

也可以安装到Conda虚拟环境中（但是如果用于 ROS 的不建议安装到虚拟环境中）

```bash
cd ~
sudo apt update
sudo apt install -y python3-pip portaudio19-dev
pip install unitree_webrtc_connect
```

### ii. 手动安装

```bash
# 源码进行安装
cd ~
sudo apt update
sudo apt install -y python3-pip portaudio19-dev

# pip 源永久换成国内(清华源)
pip3 config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

# 更新安装工具
pip install --upgrade setuptools pip
# 或者
pip3 install --upgrade setuptools pip -i https://pypi.tuna.tsinghua.edu.cn/simple

# 必须是官网下载下来的，不能是已经 pip 安装过的，不同电脑复制过来的那种
git clone https://github.com/legion1581/unitree_webrtc_connect.git
cd unitree_webrtc_connect
pip3 install -e .
```

**验证是否安装成功**

```bash
unitree@ubuntu:~$ python3 -c "import unitree_webrtc_connect; print('✅ 安装成功！')"
✅ 安装成功！

unitree@ubuntu:~$ pip show unitree_webrtc_connect
Name: unitree_webrtc_connect
Version: 2.0.4
Summary: Connect to the Unitree Go2 and G1 with WebRTC
Home-page: 
Author: 
Author-email: legion1581 <legion1581@gmail.com>
License: 
Location: /home/unitree/.local/lib/python3.8/site-packages
Editable project location: /home/unitree/unitree_webrtc_connect
Requires: aiortc, flask-socketio, lz4, numpy, opencv-python, packaging, pyaudio, pycryptodome, pydub, requests, sounddevice, wasmtime
Required-by:
```

> [!TIP]
>
> - **源码安装出现错误**
>
>   虽然升级了 pip，但系统仍在调用旧的系统版 pip，因此报错。原因如下：
>   - 新版 pip 安装在 /home/unitree/.local/bin
>   - 输入 pip 时，实际运行的还是 /usr/bin/pip（旧版），导致并未使用到新版 pip
>
>   请在当前目录依次执行以下命令：
>
>   1. 用新版 pip 安装
>     ```bash
>     /home/unitree/.local/bin/pip install -e .
>     ```
>   2. 第二步（可选，用于永久使用新版 pip）
>     ```bash
>     echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
>     source ~/.bashrc
>     pip3 install -e .
>     ```
>     >安装完成后，请勿删除或移动安装文件，否则 Python 调用时会出错。
>
>   或者也可以直接使用：
>
>   ```bash
>   # 安装到系统目录，不知道会不会有权限问题
>   sudo pip3 install -e .
>   ```
>

## c. 配置说明

- **机器人 IP 怎么查？**
  1. 机器人开机
  2. 电脑连接机器人的热点 / 同一局域网
  3. 使用 arp -a 或路由器后台查看设备列表，找到宇树机器人的 IP
  4. 常见默认 IP：192.168.123.12（Go1/M4 通用）
- **项目支持宇树主流四足机器人**
  - Go1
  - Go2
  - M4
  - H1
  - 其他 WebRTC 协议的宇树机器人

## d. 问题排查

- **连接超时 / 失败**
  - 检查电脑和机器人**同一网络**
  - 确认机器人 **IP 正确**
  - 机器人**必须开机并处于待机状态**
- **报错缺少库**
  ```bash
  # 重新执行依赖安装
  pip install --force-reinstall -r requirements.txt
  ```
- **视频窗口打不开**
  ```bash
  # 确保安装了 OpenCV
  pip install opencv-python
  ```

## e. 基本参数

```python
from enum import Enum

# 定义 WebRTC 数据通道中消息的类型标识
DATA_CHANNEL_TYPE = {
    "VALIDATION": "validation",      # 验证消息，用于连接校验
    "SUBSCRIBE": "subscribe",        # 订阅请求，向机器人请求订阅某个主题
    "UNSUBSCRIBE": "unsubscribe",    # 取消订阅请求
    "MSG": "msg",                    # 普通消息
    "REQUEST": "req",                # 请求消息（如 API 调用）
    "RESPONSE": "res",               # 响应消息（对请求的回复）
    "VID": "vid",                    # 视频数据通道标识
    "AUD": "aud",                    # 音频数据通道标识
    "ERR": "err",                    # 错误消息
    "HEARTBEAT": "heartbeat",        # 心跳包，保持连接活跃
    "RTC_INNER_REQ": "rtc_inner_req",# WebRTC 内部请求
    "RTC_REPORT": "rtc_report",      # WebRTC 状态上报
    "ADD_ERROR": "add_error",        # 添加错误记录
    "RM_ERROR": "rm_error",          # 移除错误记录
    "ERRORS": "errors",              # 获取错误列表
}

# WebRTC 连接方式枚举
class WebRTCConnectionMethod(Enum):
    LocalAP = 1    # 机器人作为 Wi-Fi 热点，上位机连接此热点
    LocalSTA = 2   # 机器人和上位机连接到同一个局域网路由器
    Remote = 3     # 远程连接（通过互联网）

# 应用层错误码对应的中文描述（宇树机器人常见故障）
app_error_messages = {
    "app_error_code_100_1": "DDS message timeout",              # DDS 通信超时
    "app_error_code_100_10": "Battery communication error",     # 电池通信错误
    "app_error_code_100_2": "Distribution switch abnormal",     # 配电开关异常
    "app_error_code_100_20": "Abnormal mote control communication", # 电机控制通信异常
    "app_error_code_100_40": "MCU communication error",         # MCU 通信错误
    "app_error_code_100_80": "Motor communication error",       # 电机通信错误
    "app_error_code_200_1": "Rear left fan jammed",             # 左后风扇堵转
    "app_error_code_200_2": "Rear right fan jammed",            # 右后风扇堵转
    "app_error_code_200_4": "Front fan jammed",                 # 前风扇堵转
    "app_error_code_300_1": "Overcurrent",                      # 过流
    "app_error_code_300_10": "Winding overheating",             # 绕组过热
    "app_error_code_300_100": "Motor communication interruption",# 电机通信中断
    "app_error_code_300_2": "Overvoltage",                      # 过压
    "app_error_code_300_20": "Encoder abnormal",                # 编码器异常
    "app_error_code_300_4": "Driver overheating",               # 驱动器过热
    "app_error_code_300_8": "Generatrix undervoltage",          # 母线欠压
    "app_error_code_400_1": "Motor rotate speed abnormal",      # 电机转速异常
    "app_error_code_400_10": "Abnormal dirt index",             # 脏污指数异常（雷达/镜头）
    "app_error_code_400_2": "PointCloud data abnormal",         # 点云数据异常
    "app_error_code_400_4": "Serial port data abnormal",        # 串口数据异常
    "app_error_code_500_1": "UWB serial port open abnormal",    # UWB 串口打开异常
    "app_error_code_500_2": "Robot dog information retrieval abnormal", # 获取机器人信息异常
    "app_error_code_600_4": "Overheating software protection",  # 过热软件保护
    "app_error_code_600_8": "Low battery software protection",  # 低电量软件保护
    "app_error_source_100": "Communication firmware malfunction", # 通信固件故障
    "app_error_source_200": "Communication firmware malfunction", # 同上（不同代码段）
    "app_error_source_300": "Motor malfunction",                # 电机故障
    "app_error_source_400": "Radar malfunction",                # 雷达故障
    "app_error_source_500": "UWB malfunction",                  # UWB 故障
    "app_error_source_600": "Motion Control",                   # 运动控制故障
    "app_error_wheel_300_100": "Motor Communication Interruption", # 轮式电机通信中断
    "app_error_wheel_300_40": "Calibration Data Abnormality",   # 校准数据异常
    "app_error_wheel_300_80": "Abnormal Reset"                  # 复位异常
}

# WebRTC 通信中可用的主题（Topic）名称，用于订阅或发布数据
RTC_TOPIC = {
    "LOW_STATE": "rt/lf/lowstate",               # 底层状态数据（电机、IMU、电量等）
    "MULTIPLE_STATE": "rt/multiplestate",        # 复合状态（多个传感器汇总）
    "FRONT_PHOTO_REQ": "rt/api/videohub/request",# 请求拍照或视频功能
    "ULIDAR_SWITCH": "rt/utlidar/switch",        # 控制宇树雷达开关
    "ULIDAR": "rt/utlidar/voxel_map",            # 雷达体素地图数据
    "ULIDAR_ARRAY": "rt/utlidar/voxel_map_compressed", # 压缩的雷达体素地图
    "ULIDAR_STATE": "rt/utlidar/lidar_state",    # 雷达状态信息
    "ROBOTODOM": "rt/utlidar/robot_pose",        # 机器人里程计位姿（雷达估算）
    "UWB_REQ": "rt/api/uwbswitch/request",       # UWB 开关请求
    "UWB_STATE": "rt/uwbstate",                  # UWB 状态数据
    "LOW_CMD": "rt/lowcmd",                      # 底层控制指令（电机目标值等）
    "WIRELESS_CONTROLLER": "rt/wirelesscontroller", # 无线手柄输入数据
    "SPORT_MOD": "rt/api/sport/request",         # 运动模式 API 请求
    "SPORT_MOD_STATE": "rt/sportmodestate",      # 运动模式状态（高层）
    "LF_SPORT_MOD_STATE": "rt/lf/sportmodestate",# 低通滤波后的运动模式状态
    "BASH_REQ": "rt/api/bashrunner/request",     # 执行 Shell 命令的请求
    "SELF_TEST": "rt/selftest",                  # 自检结果
    "GRID_MAP": "rt/mapping/grid_map",           # 栅格地图数据
    "SERVICE_STATE": "rt/servicestate",          # 各服务运行状态
    "GPT_FEEDBACK": "rt/gptflowfeedback",        # GPT 对话反馈
    "VUI": "rt/api/vui/request",                 # 语音用户界面请求
    "OBSTACLES_AVOID": "rt/api/obstacles_avoid/request", # 避障 API 请求
    "SLAM_QT_COMMAND": "rt/qt_command",          # SLAM 系统 QT 命令
    "SLAM_ADD_NODE": "rt/qt_add_node",           # SLAM 添加图节点
    "SLAM_ADD_EDGE": "rt/qt_add_edge",           # SLAM 添加图边
    "SLAM_QT_NOTICE": "rt/qt_notice",            # SLAM QT 通知
    "SLAM_PC_TO_IMAGE_LOCAL": "rt/pctoimage_local", # 点云到图像的局部转换
    "SLAM_ODOMETRY": "rt/lio_sam_ros2/mapping/odometry", # LIO-SAM 里程计
    "ARM_COMMAND": "rt/arm_Command",             # 机械臂控制命令
    "ARM_FEEDBACK": "rt/arm_Feedback",           # 机械臂反馈数据
    "AUDIO_HUB_REQ": "rt/api/audiohub/request",  # 音频中心 API 请求
    "AUDIO_HUB_PLAY_STATE": "rt/audiohub/player/state", # 音频播放状态
    "GAS_SENSOR": "rt/gas_sensor",               # 气体传感器数据
    "GAS_SENSOR_REQ": "rt/api/gas_sensor/request", # 气体传感器 API 请求
    "LIDAR_MAPPING_CMD": "rt/uslam/client_command",   # 建图命令
    "LIDAR_MAPPING_CLOUD_POINT": "rt/uslam/frontend/cloud_world_ds", # 建图点云（降采样）
    "LIDAR_MAPPING_ODOM": "rt/uslam/frontend/odom",  # 建图里程计
    "LIDAR_MAPPING_PCD_FILE": "rt/uslam/cloud_map",  # 点云地图文件
    "LIDAR_MAPPING_SERVER_LOG": "rt/uslam/server_log", # 建图服务器日志
    "LIDAR_LOCALIZATION_ODOM": "rt/uslam/localization/odom", # 定位里程计
    "LIDAR_NAVIGATION_GLOBAL_PATH": "rt/uslam/navigation/global_path", # 全局导航路径
    "LIDAR_LOCALIZATION_CLOUD_POINT": "rt/uslam/localization/cloud_world", # 定位点云
    "PROGRAMMING_ACTUATOR_CMD": "rt/programming_actuator/command", # 可编程执行器命令
    "ASSISTANT_RECORDER": "rt/api/assistant_recorder/request", # 辅助录音器请求
    "MOTION_SWITCHER": "rt/api/motion_switcher/request" # 运动模式切换请求
}

# 运动控制命令 ID（发送给 SPORT_MOD 主题的请求参数）
SPORT_CMD = {
    "Damp": 1001,            # 进入阻尼模式（关节放松）
    "BalanceStand": 1002,    # 平衡站立
    "StopMove": 1003,        # 停止移动
    "StandUp": 1004,         # 站立
    "StandDown": 1005,       # 蹲下/坐下
    "w": 1006,   # 恢复站立（从摔倒中恢复）
    "Euler": 1007,           # 欧拉角控制
    "Move": 1008,            # 移动指令（需附带速度方向）
    "Sit": 1009,             # 坐下
    "RiseSit": 1010,         # 从坐姿站起
    "SwitchGait": 1011,      # 切换步态
    "Trigger": 1012,         # 触发动作
    "BodyHeight": 1013,      # 设置机身高度
    "FootRaiseHeight": 1014, # 设置抬脚高度
    "SpeedLevel": 1015,      # 设置速度等级
    "Hello": 1016,           # 打招呼动作
    "Stretch": 1017,         # 伸展身体
    "TrajectoryFollow": 1018,# 轨迹跟随
    "ContinuousGait": 1019,  # 连续步态
    "Content": 1020,         # 内容动作
    "Wallow": 1021,          # 打滚
    "Dance1": 1022,          # 舞蹈1
    "Dance2": 1023,          # 舞蹈2
    "GetBodyHeight": 1024,   # 获取机身高度
    "GetFootRaiseHeight": 1025, # 获取抬脚高度
    "GetSpeedLevel": 1026,   # 获取速度等级
    "SwitchJoystick": 1027,  # 切换摇杆模式
    "Pose": 1028,            # 特定姿势
    "Scrape": 1029,          # 刮擦动作
    "FrontFlip": 1030,       # 前空翻
    "LeftFlip": 1042,        # 左侧翻
    "RightFlip": 1043,       # 右侧翻
    "BackFlip": 1044,        # 后空翻
    "FrontJump": 1031,       # 前跳
    "FrontPounce": 1032,     # 前扑
    "WiggleHips": 1033,      # 扭屁股
    "GetState": 1034,        # 获取机器人状态
    "EconomicGait": 1035,    # 节能步态
    "LeadFollow": 1045,      # 领走跟随模式
    "FingerHeart": 1036,     # 比心动作
    "Bound": 1304,           # 跳跃
    "MoonWalk": 1305,        # 太空步
    "OnesidedStep": 1303,    # 单边步
    "CrossStep": 1302,       # 交叉步
    "Handstand": 1301,       # 倒立
    "StandOut": 1039,        # 突出站立
    "FreeWalk": 1045,        # 自由行走
    "Standup": 1050,         # 站起（同 StandUp）
    "CrossWalk": 1051        # 交叉行走
}

# VUI（语音用户界面）灯光颜色枚举
class VUI_COLOR:
    WHITE: str = 'white'     # 白色
    RED: str = 'red'         # 红色
    YELLOW: str = 'yellow'   # 黄色
    BLUE: str = 'blue'       # 蓝色
    GREEN: str = 'green'     # 绿色
    CYAN: str = 'cyan'       # 青色
    PURPLE: str = 'purple'   # 紫色

# 音频 API 命令 ID（用于 AUDIO_HUB_REQ 主题）
AUDIO_API = {
    # Audio Player Commands（音频播放器命令）
    "GET_AUDIO_LIST": 1001,          # 获取音频列表
    "SELECT_START_PLAY": 1002,       # 选择并开始播放
    "PAUSE": 1003,                   # 暂停
    "UNSUSPEND": 1004,               # 恢复播放
    "SELECT_PREV_START_PLAY": 1005,  # 上一首并播放
    "SELECT_NEXT_START_PLAY": 1006,  # 下一首并播放
    "SET_PLAY_MODE": 1007,           # 设置播放模式（单曲循环/列表循环等）
    "SELECT_RENAME": 1008,           # 重命名选中的音频
    "SELECT_DELETE": 1009,           # 删除选中的音频
    "GET_PLAY_MODE": 1010,           # 获取当前播放模式
    
    # Audio Upload（音频上传）
    "UPLOAD_AUDIO_FILE": 2001,       # 上传音频文件到机器人
    
    # Internal Corpus（内部语料播放）
    "PLAY_START_OBSTACLE_AVOIDANCE": 3001, # 播放“开始避障”提示音
    "PLAY_EXIT_OBSTACLE_AVOIDANCE": 3002,  # 播放“退出避障”提示音
    "PLAY_START_COMPANION_MODE": 3003,     # 播放“开始伴游模式”提示音
    "PLAY_EXIT_COMPANION_MODE": 3004,      # 播放“退出伴游模式”提示音
    
    # Megaphone（喊话器功能）
    "ENTER_MEGAPHONE": 4001,         # 进入喊话模式
    "EXIT_MEGAPHONE": 4002,          # 退出喊话模式
    "UPLOAD_MEGAPHONE": 4003,        # 上传喊话音频
    
    # Internal Long Corpus（内部长文本语料）
    "INTERNAL_LONG_CORPUS_SELECT_TO_PLAY": 5001,   # 选择并播放长文本语料
    "INTERNAL_LONG_CORPUS_PLAYBACK_COMPLETED": 5002, # 长文本播放完成通知
    "INTERNAL_LONG_CORPUS_STOP_PLAYING": 5003      # 停止播放长文本语料
}
```

## f. 基础使用

> 相关程序代码在项目中的 `test/` 文件夹看到并使用。

**注意：** 具体方法名称请参考仓库中的示例代码 **examples/**，实际使用时，请参考宇树官方文档或库中提供的示例，尤其是需要带参数的命令，如 `Move` 和`BodyHeight` 等。

```python
# python 导库
# 所有功能都靠这个类实现：连接、取视频、取传感器、发控制指令。
from unitree_webrtc_connect import UnitreeWebRTCConnection, WebRTCConnectionMethod
```

### i. 基本连接

```python
# 在 Python 代码中导入并创建连接
from unitree_webrtc_connect import UnitreeWebRTCConnection, WebRTCConnectionMethod

# 根据你的使用场景选择连接方式：

# 方式1：AP模式（机器人自身发出WiFi热点，电脑连接该热点）
conn = UnitreeWebRTCConnection(WebRTCConnectionMethod.LocalAP)

# 方式2：STA-L模式（机器人和电脑在同一局域网）
conn = UnitreeWebRTCConnection(
    WebRTCConnectionMethod.LocalSTA, 
    ip="192.168.8.181"  # 替换为机器人的实际IP
)
# 或者只用序列号自动发现IP（仅Go2支持）
conn = UnitreeWebRTCConnection(
    WebRTCConnectionMethod.LocalSTA, 
    serialNumber="B42D2000XXXXXXXX"  # 替换为你的序列号
)

# 方式3：STA-T模式（远程连接，通过宇树服务器）
conn = UnitreeWebRTCConnection(
    WebRTCConnectionMethod.Remote,
    serialNumber="B42D2000XXXXXXXX",
    username="your_email@gmail.com",
    password="your_password"
)
```

### ii. 运动/动作

- **导入**
  ```python
  from unitree_webrtc_connect import UnitreeWebRTCConnection, WebRTCConnectionMethod
  from unitree_webrtc_connect.constant import SPORT_CMD, RTC_TOPIC  # 根据实际模块路径调整
  import json
  import time
  ```
- **建立连接**

  根据使用场景选择连接方式（以下以 STA-L 模式（局域网） 为例，需先让机器狗连接同一 WiFi，并知道其 IP）
  ```bash
  # 方式1：直接指定 IP
  conn = UnitreeWebRTCConnection(WebRTCConnectionMethod.LocalSTA, ip="192.168.8.181")
  
  # 方式2：通过序列号自动发现 IP（仅 Go2 支持）
  # conn = UnitreeWebRTCConnection(WebRTCConnectionMethod.LocalSTA, serialNumber="B42D2000XXXXXXXX")
  
  # 方式3：远程模式（需宇树账号）
  # conn = UnitreeWebRTCConnection(WebRTCConnectionMethod.Remote, serialNumber="...", username="...", password="...")
  
  # 等待连接完全建立（视网络情况，可适当延迟）
  time.sleep(2)
  ```
- **发送运动控制命令**

  控制命令需要以 JSON 格式发送到 `RTC_TOPIC["SPORT_MOD"]` 主题。

  库中通常提供了封装好的方法，但最通用的方式是直接使用 `conn.publish()` 或 `conn.send_command()`。

  具体方法名请参考仓库 **examples/** 中的示例，这里给出典型用法：
  ```python
  def send_sport_command(conn, cmd_id, params=None):
      """发送运动命令的通用函数（根据实际库 API 调整）"""
      data = {
          "cmd_id": cmd_id,
          "params": params or {}
      }
      # 假设 conn 有 publish 方法
      conn.publish(RTC_TOPIC["SPORT_MOD"], json.dumps(data))
      # 或 conn.send(RTC_TOPIC["SPORT_MOD"], data) 等
  
  # 示例：让机器狗站立
  send_sport_command(conn, SPORT_CMD["StandUp"])
  
  # 示例：前进（Move 命令通常需要传入速度参数）
  send_sport_command(conn, SPORT_CMD["Move"], {"x": 0.5, "y": 0, "z": 0, "yaw": 0})
  
  # 示例：执行舞蹈1
  send_sport_command(conn, SPORT_CMD["Dance1"])
  
  # 示例：趴下
  send_sport_command(conn, SPORT_CMD["Sit"])
  ```
- **examples/ 说明**
  ```python
  # 1. 导入必要的模块
  import asyncio
  from unitree_webrtc_connect.webrtc_driver import UnitreeWebRTCConnection, WebRTCConnectionMethod
  from unitree_webrtc_connect.constants import RTC_TOPIC, SPORT_CMD
  
  # 2. 建立连接
  conn = UnitreeWebRTCConnection(WebRTCConnectionMethod.LocalSTA, ip="192.168.8.181")
  await conn.connect()
  
  # 3. 查询当前运动模式（normal / ai / ...）
  response = await conn.datachannel.pub_sub.publish_request_new(
      RTC_TOPIC["MOTION_SWITCHER"], 
      {"api_id": 1001}   # 1001 表示查询当前模式
  )
  # 解析响应，获得当前模式名称
  
  # 4. 切换运动模式（如果需要）
  await conn.datachannel.pub_sub.publish_request_new(
      RTC_TOPIC["MOTION_SWITCHER"], 
      {
          "api_id": 1002,                 # 1002 表示切换模式
          "parameter": {"name": "normal"} # 切换到 normal 模式
      }
  )
  
  # 5. 发送运动命令
  # 无参数命令：Hello
  await conn.datachannel.pub_sub.publish_request_new(
      RTC_TOPIC["SPORT_MOD"], 
      {"api_id": SPORT_CMD["Hello"]}
  )
  
  # 带参数命令：前进
  await conn.datachannel.pub_sub.publish_request_new(
      RTC_TOPIC["SPORT_MOD"], 
      {
          "api_id": SPORT_CMD["Move"],
          "parameter": {"x": 0.5, "y": 0, "z": 0}   # 注意 z 是高度变化，不是 yaw
      }
  )
  ```
  ```python
  # 1. 定义回调函数，处理收到的状态数据
  def sportmodestatus_callback(message):
      data = message['data']   # 这里是机器人状态字典
      # 你可以像示例中那样解析并打印或保存数据
  
  # 2. 订阅主题
  conn.datachannel.pub_sub.subscribe(RTC_TOPIC['LF_SPORT_MOD_STATE'], sportmodestatus_callback)
  
  # 3. 保持事件循环运行（例如 asyncio.sleep(3600)）
  ```


# 2. GO2GO

专为宇树科技 Unitree GO2 Air 机器狗设计的群控软件，基于 WebRTC 技术。提供丰富的动作库（30+个内置动作）、可视化舞蹈序列编辑器，并内置一个长达3分钟的预设舞蹈。支持单机测试、舞蹈编排、多机群控表演及教学演示等场景。

**源码**

- **官网地址：**[timer/GO2GO: 宇树Unitree机器狗GO2的群控软件，基于webRTC](https://gitee.com/simon_133/go2-go)
- **123备份：**[go2-go-master.zip(157 KB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-yB7yv)

> [!NOTE]
>
> > 这个使用的是 `go2_webrtc_driver`，与 `unitree_webrtc_connect` 还不是一个作者的，但是配置界面什么都类似，不知道谁先谁后，应该 `go2_webrtc_driver`先，他只支持Go2，`unitree_webrtc_connect` 支持Go1/Go2。
>
> **源码**
>
> - **官网地址：**[GitHub - phospho-app/go2_webrtc_connect: Unitree Go2 WebRTC driver](https://github.com/phospho-app/go2_webrtc_connect)
> - **123备份：**[go2-webrtc-master.zip(49.0 KB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-asryv)

## a. 系统要求

| 元素       | 要求               |
| ---------- | ------------------ |
| Python     | 3.11               |
| 需要的库   | go2-webrtc-connect |
| 适配机器狗 | Unitree GO2 Air    |
| 网络       | 局域网（同一网段） |
| 空间       | 至少 2m x 2m       |

## b. 环境配置

### i. 下载项目

```bash
git clone https://gitee.com/simon_133/go2-go.git
```

### ii. 环境搭建（pyenv）

使用 `pyenv` 安装 Python 3.11，项目中的路径应该以实际路径为主。

- **安装编译依赖**
  ```bash
  sudo apt update
  sudo apt install -y make build-essential libssl-dev zlib1g-dev libbz2-dev \
  libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev xz-utils \
  tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev
  ```
- **安装 pyenv**
  ```bash
  curl https://pyenv.run | bash
  
  # 或使用国内镜像地址安装
  git clone https://gitee.com/mirrors/pyenv.git ~/.pyenv
  ```
- **配置环境变量**
  ```bash
  echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
  echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
  echo 'eval "$(pyenv init -)"' >> ~/.bashrc
  source ~/.bashrc
  ```
- **安装 Python 3.11**
  ```bash
  pyenv install 3.11.9   # 或最新的 3.11.x 版本，如 3.11.11
  
  # 使用国内镜像加速安装
  export PYTHON_BUILD_MIRROR_URL=https://mirrors.huaweicloud.com/python
  pyenv install 3.11.9
  # 或使用清华源
  export PYTHON_BUILD_MIRROR_URL=https://mirrors.tuna.tsinghua.edu.cn/python
  pyenv install 3.11.9
  ```

  编译过程可能需要几分钟，请耐心等待。编译成功示例如下：

  ```bash
  dog@ubuntu:~$ pyenv install 3.11.9
  Downloading Python-3.11.9.tar.xz...
  -> https://www.python.org/ftp/python/3.11.9/Python-3.11.9.tar.xz
  Installing Python-3.11.9...
  patching file setup.py
  Installed Python-3.11.9 to /home/dog/.pyenv/versions/3.11.9
  ```

  ```bash
  # 将全局默认 Python 切换为 3.11.9
  pyenv global 3.11.9
  
  # 将当前目录的 Python 切换为 3.11.9
  pyenv local 3.11.9
  
  # 删除本地的 pyenv 版本锁定文件（如有）
  rm -f .python-version
  # 重新加载 shell 配置
  source ~/.bashrc
  
  # 检查 Python 版本
  dog@ubuntu:~/go2-go$ python
  Python 3.11.9 (main, Mar 26 2026, 11:13:54) [GCC 9.4.0] on linux
  Type "help", "copyright", "credits" or "license" for more information.
  >>>
  [4]+  Stopped                 python
  dog@ubuntu:~/go2-go$ python --version
  Python 3.11.9
  ```
- **创建虚拟环境**
  ```bash
  # 创建名为 unitree 的虚拟环境（基于当前 Python 3.11）
  python -m venv unitree
  
  # 激活虚拟环境（常规方式）
  source unitree/bin/activate
  
  # 设置别名，方便快速进入并激活
  # 将以下行添加到 ~/.bashrc 文件中
  echo '
  # go2-go 项目虚拟环境
  alias unitree="cd ~/go2-go && source unitree/bin/activate"
  alias unitree-exit="deactivate && cd ~"
  ' >> ~/.bashrc
  
  source ~/.bashrc
  ```
- **安装项目依赖**
  ```bash
  # 升级 pip
  pip install --upgrade pip
  
  # 安装 go2-webrtc-connect（无版本要求）
  pip install go2-webrtc-connect -i https://pypi.tuna.tsinghua.edu.cn/simple
  
  # 如有 requirements.txt，可直接安装
  pip install -r requirements.txt
  
  # 使用国内清华源安装
  pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
  # 或使用阿里源
  pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/
  ```
  **requirements.txt（项目初始版本）**
  ```bash
  # Unitree GO2AIR Robot Control - Requirements
  
  # Core Framework
  PyQt5==5.15.10
  PyQt5-sip==12.13.0
  
  # Robot Control
  go2-webrtc-connect  # Unitree GO2 WebRTC connection library
  
  # Network Communication
  requests==2.31.0
  websockets==12.0
  
  # Audio Processing
  pygame==2.5.2
  numpy==1.26.0
  
  # Environment
  python-dotenv==1.0.0
  
  # Optional: Advanced audio analysis
  scipy==1.11.4
  librosa==0.10.1
  soundfile==0.12.1
  ```

### iii. 环境搭建（conda ）

这是在 Jetson Nano 中设置的，可能许多错误在小电脑中并不存在。

> 说明：使用 pyenv 创建虚拟环境后，安装 PyQt5 时出现问题。经排查，pyenv 本身正常，但无法编译 PyQt5==5.15.10。因此改用 conda 进行虚拟环境搭建与依赖包的安装。

1. **安装 conda**
  ```bash
  # 1. 下载 Miniforge（适用于 ARM64 架构）
  wget https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-Linux-aarch64.sh
  
  # 2. 安装（按提示操作，建议安装到默认位置）
  bash Miniforge3-Linux-aarch64.sh
  ```
2. **创建虚拟环境**
  ```bash
  # 安装后重新打开终端，或执行 source ~/.bashrc 使 conda 命令生效
  
  # 临时启用 conda（若 conda 命令不可用）
  eval "$(/home/dog/miniforge3/bin/conda shell.bash hook)"
  
  # 永久配置 conda（先临时启用，再执行初始化）
  eval "$(/home/dog/miniforge3/bin/conda shell.bash hook)"
  conda init
  
  # 创建一个名为 unitree 的 Python 3.11 环境
  conda create -n unitree python=3.11
  
  # 进入环境
  conda activate unitree
  
  # 设置别名（方便快速切换）
  echo "alias unitree='eval \"\$(/home/dog/miniforge3/bin/conda shell.bash hook)\" && conda activate unitree && cd ~/go2-go'" >> ~/.bashrc
  echo "alias unitree-e='conda deactivate && cd ~'" >> ~/.bashrc
  source ~/.bashrc
  
  # 使用别名
  unitree    # 启动虚拟环境并进入项目目录
  unitree-e  # 退出虚拟环境并返回家目录
  ```

  **Conda 基础命令速查**

  ```bash
  unitree            # 进入环境（自定义别名）
  conda deactivate   # 退出当前环境
  conda install xxx  # 安装包
  conda list         # 查看已安装的包
  conda env list     # 查看所有环境
  ```

  **注意：如果尚未执行 conda init，所有 conda 命令前需先运行：**

  ```bash
  eval "$(/home/dog/miniforge3/bin/conda shell.bash hook)"
  ```
3. **安装项目依赖**
  ```bash
  # 安装 PyQt5
  conda install pyqt
  
  # 验证安装
  (unitree) dog@ubuntu:~/go2-go$ python -c "from PyQt5.QtCore import QT_VERSION_STR; print('PyQt版本:', QT_VERSION_STR)"
  PyQt版本: 5.15.15
  ```

  根据 `requirements.txt` 安装依赖，推荐以下方式：
  - **一次性安装（推荐）**
    ```bash
    conda install -c conda-forge pyqt=5.15.10 pyqt5-sip=12.13.0 requests=2.31.0 websockets=12.0 pygame=2.5.2 numpy=1.26.0 python-dotenv=1.0.0 scipy=1.11.4 librosa=0.10.1 soundfile=0.12.1 -y
    ```
  - **分批安装**
    ```bash
    # 安装核心图形界面
    conda install -c conda-forge pyqt=5.15.10 pyqt5-sip=12.13.0 -y
    
    # 安装网络与环境依赖
    conda install -c conda-forge requests=2.31.0 websockets=12.0 python-dotenv=1.0.0 -y
    
    # 安装音频与科学计算库
    conda install -c conda-forge pygame=2.5.2 numpy=1.26.0 scipy=1.11.4 librosa=0.10.1 soundfile=0.12.1 -y
    
    # 其他依赖
    pip3 install pygame==2.5.2 soundfile==0.12.1 librosa==0.10.1 -i https://pypi.tuna.tsinghua.edu.cn/simple
    
    # 最后安装机器人控制库
    pip install go2-webrtc-connect -i https://pypi.tuna.tsinghua.edu.cn/simple
    ```

    - **安装音频与科学计算库**遇到的报错及解决方案
      - **报错信息：** conda-forge 未为 linux-aarch64（如 Jetson Nano 等 ARM64 架构）提供 scipy==1.11.4 的预编译包。

        ```bash
        (unitree) dog@ubuntu:~/go2-go$ conda install -c conda-forge pygame=2.5.2 numpy=1.26.0 scipy=1.11.4 librosa=0.10.1 soundfile=0.12.1 -y
        Channels:
         - conda-forge
        Platform: linux-aarch64
        Collecting package metadata (repodata.json): done
        Solving environment: failed
        
        PackagesNotFoundError: The following packages are not available from current channels:
        
          - scipy=1.11.4
        
        Current channels:
        
          - https://conda.anaconda.org/conda-forge
        
        To search for alternate channels that may provide the conda package you're
        looking for, navigate to
        
            https://anaconda.org
        
        and use the search bar at the top of the page.
        ```
      - **方案 1：安装兼容的新版 scipy**

        ```bash
        conda install -c conda-forge scipy numpy=1.26.0 -y
        conda install -c conda-forge pygame=2.5.2 librosa=0.10.1 soundfile=0.12.1 -y
        ```
      - **方案 2：使用 pip 安装精确版本（scipy==1.11.4）**

        ```bash
        sudo apt update
        sudo apt install -y gfortran gcc python3-dev libopenblas-dev liblapack-dev
        conda activate unitree
        pip install scipy==1.11.4 numpy==1.26.0 -i https://pypi.tuna.tsinghua.edu.cn/simple
        pip install pygame==2.5.2 librosa==0.10.1 soundfile==0.12.1 -i https://pypi.tuna.tsinghua.edu.cn/simple
        ```
      - **方案 3：忽略音频相关依赖**

        `scipy`、`librosa`、`soundfile` 仅用于音频可视化/分析，不影响机器人核心控制功能。
        **运行项目时，若代码中有音频相关导入，可暂时注释掉。**

        ```bash
        conda install -c conda-forge pygame=2.5.2 numpy=1.26.0 -y
        ```
4. **验证安装**

  ```bash
  echo -e "\n=== 检查 go2-go 依赖库安装情况 ===" && \
  echo "PyQt5: $(pip show PyQt5 2>/dev/null | grep Version | cut -d ' ' -f 2 || echo '未安装')" && \
  echo "PyQt5-sip: $(pip show PyQt5-sip 2>/dev/null | grep Version | cut -d ' ' -f 2 || echo '未安装')" && \
  echo "go2-webrtc-connect: $(pip show go2-webrtc-connect 2>/dev/null | grep Version | cut -d ' ' -f 2 || echo '未安装')" && \
  echo "requests: $(pip show requests 2>/dev/null | grep Version | cut -d ' ' -f 2 || echo '未安装')" && \
  echo "websockets: $(pip show websockets 2>/dev/null | grep Version | cut -d ' ' -f 2 || echo '未安装')" && \
  echo "pygame: $(pip show pygame 2>/dev/null | grep Version | cut -d ' ' -f 2 || echo '未安装')" && \
  echo "numpy: $(pip show numpy 2>/dev/null | grep Version | cut -d ' ' -f 2 || echo '未安装')" && \
  echo "python-dotenv: $(pip show python-dotenv 2>/dev/null | grep Version | cut -d ' ' -f 2 || echo '未安装')" && \
  echo "scipy: $(pip show scipy 2>/dev/null | grep Version | cut -d ' ' -f 2 || echo '未安装')" && \
  echo "librosa: $(pip show librosa 2>/dev/null | grep Version | cut -d ' ' -f 2 || echo '未安装')" && \
  echo "soundfile: $(pip show soundfile 2>/dev/null | grep Version | cut -d ' ' -f 2 || echo '未安装')" && \
  echo -e "=====================================\n"
  ```

  **示例输出（版本可能略有不同）：**
  ```bash
  === 检查 go2-go 依赖库安装情况 ===
  
  PyQt5: 5.15.11
  PyQt5-sip: 12.17.0
  go2-webrtc-connect: 0.2.1
  requests: 2.31.0
  websockets: 12.0
  pygame: 2.5.2
  numpy: 1.26.0
  python-dotenv: 1.0.0
  scipy: 1.17.1
  librosa: 0.10.1
  soundfile: 0.12.1
  =====================================
  ```
5. **修复已知错误**
  - **错误 1：**`name 'Optional' is not defined`

    原因：go2-webrtc-connect 库的代码中使用了 Optional 但未导入。

    ```bash
    # 修复：在 util.py 开头添加 Optional 的导入
    sed -i '1i from typing import Optional' /home/dog/miniforge3/envs/unitree/lib/python3.11/site-packages/go2_webrtc_driver/util.py
    ```

    > 说明：Python 3.10+ 虽然支持 | 类型语法，但 Optional 仍需显式导入。
  - **错误 2：**`module 'numpy._globals' has no attribute '_signature_descriptor'`

    原因：numpy 版本过新导致冲突，需要降级到 1.26.x。

    ```bash
    pip uninstall numpy -y
    pip install numpy==1.26.0 -i https://pypi.tuna.tsinghua.edu.cn/simple
    ```

    参考：项目文档 `使用说明.md` 中也提到了修复 `Optional` 错误的方法（适用于 Windows PowerShell 或手动编辑）。
6. **运行程序**
  ```bash
  cd ~/go2-go/
  python go2_control_panel_v4.py
  ```

  **运行情况总结：**
  - 连接功能正常。
  - 但在进行舞蹈控制时会出现断连，断连后所有按钮无响应。
  - 初步判断该问题可能源于 go2-webrtc-connect 库本身。
  - 尽管如此，该项目仍具有参考价值，其群控实现思路值得借鉴。


# 3. go2_ros2_sdk

| 项目         | 地址                                                         | 说明         |
| ------------ | ------------------------------------------------------------ | ------------ |
| **主仓库**   | [abizovnuralem/go2_ros2_sdk](https://github.com/abizovnuralem/go2_ros2_sdk) | 社区官方维护 |
| **国内镜像** | [gitcode 镜像](https://gitcode.com/gh_mirrors/go/go2_ros2_sdk) | CSDN 同步    |

这个项目参考的控制 API，他是集成到了自己的程序中，只是参考了，以后如果使用 ROS2 可以直接使用这个项目。

[GitHub - tfoldi/go2-webrtc](https://github.com/tfoldi/go2-webrtc)





----



