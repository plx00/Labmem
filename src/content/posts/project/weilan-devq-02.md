---
title: WEILAN 机器狗（二）
published: 2025-09-21
updated: 2026-08-11
description: 蔚蓝机器狗的群体控制
image: /assets/bolg_cover/weilan-devq-02.webp
tags: [机器狗, ROS, 群控]
category: 项目
draft: false
author: larry
password: ""
passwordHint: ""
---

---

# 前言

**[WEILAN 机器狗（一）](/posts/project/weilan-devq-01/)**

**[WEILAN 机器狗（三）](/posts/project/weilan-devq-03/)**

> 本章重点介绍蔚蓝机器狗 BabyAlpha Dev-Q 的集群控制方案：基于官方 Agentos_sdk 功能包完成局域网多机通信。整套流程先在 Ubuntu 主机上完成集群控制逻辑验证，再将完整控制链路移植至搭载树莓派的控制主板中。

> 实现逻辑：以树莓派主板作为总控终端并开启无线热点，所有机器狗接入该热点组成同一局域网；依托 Rosbridge 实现消息转发，总控终端通过 IP 寻址下发指令，完成对全部机器狗的统一集群管控。

Github：[AlphaDogDeveloper](https://github.com/AlphaDogDeveloper)

[原文档PDF原件](https://1831996731.share.123pan.cn/123pan/wdzVjv-jgWvd)

[各种代码包文件](https://1831996731.share.123pan.cn/123pan/wdzVjv-TFWvd)

- **基础环境**

  | **主机设备**   | Raspberry Pi 4b8g                                            |
  | :------------- | :----------------------------------------------------------- |
  | **操作系统**   | Ubuntu 20.04 LTS                                             |
  | **传感器设备** |                                                              |
  | **ROS版本**    | ROS Noetic Ninjemys                                          |
  | **补充说明**   | 本环境为项目/测试的基础运行环境，后续所有操作均基于此环境开展，若环境有变更，需在文档中同步更新。 |

- **参考链接**

  | **产品名称**                   |                     **BabyAlpha Dev-Q**                      |
  | :----------------------------- | :----------------------------------------------------------: |
  | **agentos_sdk wiki**           |  **https://github.com/AlphaDogDeveloper/agentos_sdk/wiki**   |
  | **操作指引**                   |   **https://weilan.dochelp.cn/c/1681563736140279810.html**   |
  | **Github issues**              | **https://github.com/AlphaDogDeveloper/dev_robot_control_sdk/issues/created_by/21%20%20%20---%20Open?q=is%3Aissue** |
  | **dev_robot_control_sdk-main** | **[AlphaDogDeveloper/dev_robot_control_sdk: SDK for developing motion control software on WeiLan Dev series robots.](https://github.com/AlphaDogDeveloper/dev_robot_control_sdk)** |
  | **tools-main**                 | **[AlphaDogDeveloper/tools: burn tool, guides, etc.](https://github.com/AlphaDogDeveloper/tools)** |
  | **robodog**                    | **[00make/robodog: A Python library for controlling AlphaDog robotic dogs.](https://github.com/00make/robodog)** |
  | **alphadog_ros_ctl**           | **[alphadog_ros_ctl: 蔚蓝机器狗dev版本使用ros1 bridge连通ROS Humble和ROS Noetic，实现Joystick手柄遥控操作机器狗。](https://gitee.com/chenxin852/alphadog_ros_ctl)** |
  | **agentos** 的一个新的文档     | **[安装指南 — agentos 0.1 文档](https://agentos.readthedocs.io/zh-cn/latest/user_guide/installation.html)** |
  | 相关视频                       | **[二次开发机器狗学习分享_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1PvVZzQEGc?buvid=XY729C870210667572C0A4E453592000FE96B&from_spmid=search.search-result.0.0&is_story_h5=false&mid=XKX9a9aSqYtdWnp9LA7rtg%3D%3D&plat_id=116&share_from=ugc&share_medium=android&share_plat=android&share_session_id=c5afb3dd-fd5f-4013-87f9-5a87d55434f5&share_source=WEIXIN&share_tag=s_i&spmid=united.player-video-detail.0.0&timestamp=1757478588&unique_k=ehKXAKf&up_id=1128287275&vd_source=44174cb9e1b481198e2339e3ef279079)** |

本文件将在上述基础环境的框架下，详细记录项目开发、测试验证等相关工作的进展。各具体模块可根据实际需求灵活规划与补充。鉴于篇幅及内容聚焦考量，有关**系统安装及部分常用配置**的具体细节将不做赘述。

# 1. 群控通信

项目初期规划了两套集群控制实现方案：ROS 分布式通信、Rosbridge 转发通信。经实际调试验证，ROS 分布式通信方案无法满足集群控制需求，最终选用 Rosbridge 方案完成多机群控开发。

## a. ROS分布式

通过连接同一个网络，主机+两个机器人可以互相通信，即使两个机器人运行完全相同的系统和软件程序，通过设置不同的 `ROS_NAMESPACE` 和 `ROS_IP`，你可以区分它们并分别控制它们。这是ROS多机通信中常用的方法。

机器狗固件强制绑定 10.10.10.10 作为 ROS Master 地址，修改分布式通信环境变量会导致内置程序失效，因此 ROS 分布式方案无法用于群控。

### i. 布置说明

#### 1. 设置命名空间

为每个机器人设置不同的命名空间，这样可以避免话题和服务名称冲突。例如，假设机器人1的命名空间是 `/robot1`，机器人2的命名空间是 `/robot2`。

#### 2.  修改ROS环境变量

在每个机器人的配置文件中设置相应的命名空间。例如，在`~/.bashrc`文件中添加以下内容：

```bash
# 对于机器人1
export ROS_NAMESPACE=/robot1
```

```bash
# 对于机器人2
export ROS_NAMESPACE=/robot2
```

#### 3.  启动机器人节点

在每个机器人上启动相应的节点，并确保它们使用正确的命名空间。例如：

```bash
roslaunch robot1_launch_file.launch
roslaunch robot2_launch_file.launch
```

**这个不需要设置只需要将机器狗启动即可，机器狗已自动启动了节点。**

#### 4.  发送动作请求

在主机上，使用`axclient.py`工具分别向两个机器人发送不同的动作请求。确保在命令中指定正确的命名空间。

```bash
# 对于机器人1（执行`action_id: 4`）
rosrun actionlib_tools axclient.py /robot1/agent_skill/set_motion_params/execute agent_msgs/ExecuteAction \
invoker: 'test_skill' \
invoke_priority: 15 \
hold_time: 3.0 \
args: '{"action_id": 4}'
```

```bash
# 对于机器人2（执行`action_id: 2`）
rosrun actionlib_tools axclient.py /robot2/agent_skill/set_motion_params/execute agent_msgs/ExecuteAction \
invoker: 'test_skill' \
invoke_priority: 15 \
hold_time: 3.0 \
args: '{"action_id": 2}'
```

### ii. 构建环境

假设主机的IP地址是 `192.168.1.100`，机器人1的IP地址是 `192.168.1.101`，机器人2的IP地址是 `192.168.1.102`。

**如果连接的是路由器可以登录到后台查看三台设备的IP，如果是手机热点，可以直接热点设置那里查看。**

1. **在主机上启动`roscore`**：

   ```bash
   roscore
   ```

2. **在主机、机器人1和机器人2上配置环境变量（.bashrc中配置也可以）**：

   - 在主机上：

     ```bash
     export ROS_MASTER_URI=http://192.168.1.100:11311
     export ROS_IP=192.168.1.100
     ```

   - 在机器人1上：

     ```bash
     export ROS_MASTER_URI=http://192.168.1.100:11311
     export ROS_IP=192.168.1.101
     export ROS_NAMESPACE=/robot1
     ```

   - 在机器人2上：

     ```bash
     export ROS_MASTER_URI=http://192.168.1.100:11311
     export ROS_IP=192.168.1.102
     export ROS_NAMESPACE=/robot2
     ```

   - 机器人端原设置

     ```bash
     export ROS_MASTER_URI=http://10.10.10.10:11311
     export ROS_IP=10.10.10.10
     ```

3. **在机器人1和机器人2上启动相应的节点**：

   ```bash
   # 这个不需要设置只需要将机器狗启动即可，机器狗已自动启动了节点。
   roslaunch robot1_launch_file.launch
   roslaunch robot2_launch_file.launch
   ```

4. **在主机上发送动作请求**：

   - 对于机器人1：

     ```bash
     rosrun actionlib_tools axclient.py /robot1/agent_skill/do_action/execute agent_msgs/ExecuteAction \
     invoker: 'test_skill' \
     invoke_priority: 15 \
     hold_time: 3.0 \
     args: '{"action_id": 4}'
     ```

   - 对于机器人2：

     ```bash
     rosrun actionlib_tools axclient.py /robot2/agent_skill/do_action/execute agent_msgs/ExecuteAction \
     invoker: 'test_skill' \
     invoke_priority: 15 \
     hold_time: 3.0 \
     args: '{"action_id": 2}'
     ```

通过以上步骤，可以分别控制两个机器人执行不同的动作。

### iii. 群控测试

理论上可以用脚本发送，同时发送两包。

```python
#!/usr/bin/env python
import subprocess
import time

def send_action_request(robot_namespace, action_id):
    command = [
        "rosrun", "actionlib_tools", "axclient.py",
        f"/{robot_namespace}/agent_skill/do_action/execute", "agent_msgs/ExecuteAction",
        "invoker: 'test_skill'",
        "invoke_priority: 15",
        "hold_time: 3.0",
        f"args: '{{\"action_id\": {action_id}}}'"
    ]
    subprocess.Popen(command)

def main():
    action_id = 4  # 想要执行的动作ID
    send_action_request("robot1", action_id)
    send_action_request("robot2", action_id)

if __name__ == "__main__":
    main()
```

可以依据以上思路改一下 **~/.bashrc**

```xml
export ROS_MASTER_URI=http://10.10.10.10:11311
export ROS_IP=10.10.10.10

source ~/agent_ws/devel/setup.bash
```

采用 ROS 分布式通信方案无法实现集群控制，已在机器人端完成环境变量配置：

```bash
# 不可以更改为
export ROS_MASTER_URI=http://192.168.1.100:11311
export ROS_IP=192.168.1.102

# 只能为原厂的，这样他的固件程序才可以正常运行，应该其固件程序依托于10.10.10.10
export ROS_MASTER_URI=http://10.10.10.10:11311
export ROS_IP=10.10.10.10
```

该配置为 ROS 分布式通信标准配置流程，经反复核验确认参数设置无误；但配置完成后，机器狗原厂内置固件运行程序无法正常调用，由此判定该方案不适用于本设备集群控制场景。

## b. rosbridge

### i. 介绍

**Rosbridge** 是一个用于 ROS（Robot Operating System）的工具，它允许通过网络接口（如 WebSocket）与 ROS 系统进行通信，从而实现远程控制机器人、访问 ROS 话题（Topics）、服务（Services）和参数（Parameters）等功能。

#### 1. 基本功能

- **网络通信**：通过 WebSocket 提供与 ROS 系统的实时通信。
- **话题交互**：订阅和发布 ROS 话题，实现数据的实时传输。
- **服务调用**：调用和响应 ROS 服务，执行特定的操作。
- **参数管理**：获取和设置 ROS 参数，配置机器人系统。

#### 2. 应用场景

- **远程控制**：通过 Web 浏览器或移动设备远程控制机器人。
- **数据可视化**：在 Web 界面中实时显示机器人传感器数据。
- **集成开发**：方便与其他非 ROS 系统（如 Web 应用、移动应用）集成。

Rosbridge 是 ROS 生态系统中一个非常实用的工具，尤其适合需要通过网络进行机器人控制和数据交互的场景。

这个是查看项目 **robodog-main** 看到的方法，就是机器狗与控制端连接到一个 局域网Wifi（理论上内网穿透远程控制也可以）进行控制。

### ii. 测试

使用官方App将机器狗连接到一个 **WiFi路由器** 下，控制端也连接到这个**WiFi**。

#### 1. 查询IP

然后在机器狗端查询连接的IP，因为机器狗端的 **rosbridge_server** 服务是默认已经开启了，所以不用设置。

```bash
root@sport:~# ifconfig
br0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.10.10.10  netmask 255.255.255.0  broadcast 10.10.10.255
        inet6 fe80::3278:c9ff:fe51:8878  prefixlen 64  scopeid 0x20<link>
        ether 30:78:c9:51:88:78  txqueuelen 1000  (Ethernet)
        RX packets 1098707  bytes 127015431 (127.0 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 2096034  bytes 2320689668 (2.3 GB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

eth0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether 30:78:c9:51:88:78  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device interrupt 127

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1  (Local Loopback)
        RX packets 1122574  bytes 181349158 (181.3 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 1122574  bytes 181349158 (181.3 MB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

wlan0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.0.108  netmask 255.255.255.0  broadcast 192.168.0.255
        ether 54:78:c9:51:88:78  txqueuelen 1000  (Ethernet)
        RX packets 2136918  bytes 2322298052 (2.3 GB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 938902  bytes 131156628 (131.1 MB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

wlan1: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        ether 56:78:c9:51:88:78  txqueuelen 1000  (Ethernet)
        RX packets 1098707  bytes 127015431 (127.0 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 2091014  bytes 2349755204 (2.3 GB)
        TX errors 0  dropped 2 overruns 0  carrier 0  collisions 0
```

也可以登录WIFI路由器后台查看对应的连接设备IP，这里获得的IP为`192.168.0.108`

#### 2. 测试端口

上面查到了IP，接下来在**控制端**打开终端可以输入

```bash
# 测试局域网络是否联通
ping 192.168.0.108	
#测试端口是否开放
telnet 192.168.0.108 9090	

Trying 192.168.0.108...
Connected to 192.168.0.108.
Escape character is '^]'.
Connection closed by foreign host.
```

这里显示连接中断，rosbridge_server用的是 **WebSocket协议**，而`telnet`用的是纯文本TCP连接。WebSocket连接需要握手过程，直接用telnet连接通常**会被服务器直接关闭**，这是正常现象。



使用**roslibpy**测试端口是否正确开放，先进行安装(第2步可以省略)

```bash
# 1. 安装Python3-pip工具（树莓派/ Debian系系统）
sudo apt install -y python3-pip

# 2. 升级pip到最新版（避免低版本pip安装包兼容问题）
pip3 install --upgrade pip -i https://pypi.tuna.tsinghua.edu.cn/simple

# 3. 安装指定版本roslibpy（1.8.1，核心模块完整）
pip3 install roslibpy==1.8.1 -i https://pypi.tuna.tsinghua.edu.cn/simple
```

[^ps]: **指定版本`roslibpy==1.8.1`**：核心原因：`roslibpy 2.0.0+` 为适配 ROS 2 做了破坏性更新，移除了`roslibpy.actionlib`核心子模块（该模块是端口测试、ROS Action 通信的关键依赖）；而 1.8.1 版本是 ROS 1 兼容的稳定版，保留了`actionlib`/`socket`等端口测试必需的模块，且跨机器环境一致性更强（另一台正常机器也使用该版本）

>  **指定版本`roslibpy==1.8.1`**：核心原因：`roslibpy 2.0.0+` 为适配 ROS 2 做了破坏性更新，移除了`roslibpy.actionlib`核心子模块（该模块是端口测试、ROS Action 通信的关键依赖）；而 1.8.1 版本是 ROS 1 兼容的稳定版，保留了`actionlib`/`socket`等端口测试必需的模块，且跨机器环境一致性更强（另一台正常机器也使用该版本）

```python title="demo_connnect_9090.py"
import time
from roslibpy import Ros

def test_rosbridge_connection(host: str, port: int):
    ros = Ros(host=host, port=port)

    try:
        ros.run()
        time.sleep(2)  # 等待连接
        if ros.is_connected:
            print(f"连接成功: {host}:{port}")
        else:
            print("连接失败")
    except Exception as e:
        print(f"连接异常: {e}")
    finally:
        ros.terminate()

if __name__ == '__main__':
    host = '192.168.0.108'  # 替换成你的机器狗IP
    port = 9090
    test_rosbridge_connection(host, port)
```

以上运行后显示连接成功

```bash
a@ubuntu:~/Desktop$ python3 demo_connnect_9090.py 
连接成功: 192.168.0.108:9090
```

#### 3. 测试控制

通过 **`192.168.0.108:9090`** 这个端口进行控制机器狗做技能

```python title="demo_control_9090.py"
import time
from roslibpy import Ros, Message, Topic
from roslibpy.actionlib import ActionClient, Goal

def control_robot_action(host: str, port: int):
    # 1. 初始化ROS连接
    ros = Ros(host=host, port=port)
    
    try:
        ros.run()
        time.sleep(2)  # 等待连接稳定
        
        if not ros.is_connected:
            print("连接机器人失败，请检查IP和端口")
            return
        print(f"已连接到机器人: {host}:{port}")

        # 2. 创建ActionClient
        action_client = ActionClient(
            ros,
            '/agent_skill/do_action/execute',
            'agent_msgs/ExecuteAction'
        )

        # 3. 改进的动作服务器就绪检测（监听status话题直接判断）
        print("等待动作服务器就绪...")
        server_ready = False
        timeout = 10  # 超时时间（秒）
        start_time = time.time()

        # 直接监听action的status话题
        status_topic = Topic(ros, '/agent_skill/do_action/execute/status', 'actionlib_msgs/GoalStatusArray')
        
        def on_status_message(message):
            nonlocal server_ready
            # 只要有状态消息，说明服务器已启动
            if message['status_list'] is not None:
                server_ready = True
        
        status_topic.subscribe(on_status_message)
        
        # 循环等待直到服务器就绪或超时
        while not server_ready and (time.time() - start_time) < timeout:
            time.sleep(0.1)
        
        status_topic.unsubscribe()
        
        if not server_ready:
            print("动作服务器未响应，请检查机器人端是否启动相关节点")
            return

        # 4. 定义动作目标参数（严格匹配axclient的参数格式）
        goal = Goal(action_client, Message({
            'invoker': 'test_skill',
            'invoke_priority': 15,
            'hold_time': 3.0,
            'args': '{"action_id": 0}'
        }))

        # 5. 定义动作回调
        def feedback_callback(feedback):
            print(f"收到反馈: {feedback}")

        def result_callback(result):
            print(f"动作执行完成，结果: {result}")
            
        def goal_status_callback(status):
            print(f"目标状态: {status}")
            # 状态码2表示目标已被接受并执行中
            if status['status'] == 2:
                print("动作服务器已接受目标，正在执行...")

        # 6. 发送动作目标并设置回调
        goal.on('feedback', feedback_callback)
        goal.on('result', result_callback)
        goal.on('status', goal_status_callback)
        goal.send()
        print("已发送动作指令，等待执行...")

        # 7. 等待动作完成
        goal.wait(timeout=30)

    except Exception as e:
        print(f"控制过程中发生错误: {e}")
    finally:
        ros.terminate()
        print("连接已关闭")

if __name__ == '__main__':
    ROBOT_IP = '192.168.0.108'
    ROSBRIDGE_PORT = 9090
    control_robot_action(ROBOT_IP, ROSBRIDGE_PORT)
```

输出以下内容，成功控制机器狗。

```bash
a@ubuntu:~/Desktop$ python3 demo_control_9090.py 
已连接到机器人: 192.168.0.108:9090
等待动作服务器就绪...
已发送动作指令，等待执行...
收到反馈: {'progress': 0.0, 'state': ''}
动作执行完成，结果: {'result': 1, 'response': ''}
控制过程中发生错误: Goal failed to receive result
连接已关闭
```



# 2. 控制终端

**通过一个树莓派的控制终端来群控机器狗。**

> [!TIP]
>
> 2025-10-20
>
> 新到的机器狗进行测试，机器狗本地端可以不进行 **dev_robot_control_sdk**、**agentos_sdk**的配置可以直接进行使用，直接使用树莓派通过网口实现控制。

> [!IMPORTANT]
>
> **一些常用的配置**
>
> 可通过两种方式实现手机 APP 对设备的远程控制：一是基于 CH340 串口接收指令完成控制，该方案实现逻辑简单；二是设备接入无线网络，通过 WiFi 链路实现控制交互。
>
> - **硬件与烧录准备**
>
>   所需物料：树莓派、空白 TF 存储卡、读卡器；系统镜像烧录工具选用官方提供的 Raspberry Pi Imager，可直接从树莓派官网获取。
>
> - **树莓派开机 WiFi 配置**
>
>   设备开机自动连接 WiFi 可修改配置文件 /etc/netplan/50-cloud-init.yaml 完成设置。
>
> - **自定义快捷命令配置**
>
>   执行下述脚本加载环境，并配置快捷指令 dog_run，一键启动设备主控程序：
>   ```shell
>   source /home/HiveBltDg/shell/main_tab_completion.bash
>   alias dog_run="python3 /home/HiveBltDg/main.py ui"
>
> - **APT/DPKG 锁占用故障修复脚本**
>
>   当系统出现软件包锁占用异常时，执行以下命令清理锁文件并修复软件包依赖：
>
>   ```bash
>   # 终止dpkg、apt系列占用进程
>   sudo killall dpkg apt apt-get
>                             
>   # 删除dpkg与apt缓存锁文件
>   sudo rm /var/lib/dpkg/lock
>   sudo rm /var/lib/dpkg/lock-frontend
>   sudo rm /var/cache/apt/archives/lock
>                             
>   # 修复异常中断的软件包配置
>   sudo dpkg --configure -a
>   ```

## a. 终端方案

> [!TIP]
>
> 机器狗联网环境需访问外网，因此需额外增设上网网卡，本方案选用物联网卡实现外网接入。
> 设备支持通过机器狗自身 WiFi 完成网络自检；同时配置 IP 白名单策略：仅机器狗本机 IP 可访问互联网，其余终端仅允许接入 WiFi 并通过 SSH 登录设备，禁止外网访问权限。
>
>  
>
> 下单的链接（**选择的是 20G一年的套餐**）：
>
> 【淘宝】假一赔四 https://e.tb.cn/h.S4njc3ZaeIELXr4?tk=lRBf4xA7682 CZ005 「ML307C USB免驱4G网卡/RNDIS/ECM/工控机医疗树莓派室外数据采集」
> 点击链接直接打开 或者 淘宝搜索直接打开
>
> ![image-20260811160753952](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811160754428.webp)
>
> ```bash
> dog@ubuntu:/home$ ifconfig
> ... ...
> 
> eth1: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
>      inet 192.168.0.100  netmask 255.255.255.0  broadcast 192.168.0.255
>      inet6 fe80::976d:4b01:34c4:12d2  prefixlen 64  scopeid 0x20<link>
>      ether ac:0c:29:a3:9b:6d  txqueuelen 1000  (Ethernet)
>      RX packets 214  bytes 182874 (182.8 KB)
>      RX errors 0  dropped 0  overruns 0  frame 0
>      TX packets 233  bytes 42989 (42.9 KB)
>      TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
> 
> ... ...
> ```
>
> > 流量充值:  
> >
> > 微信服务号：乐联万物        
> >
> > ICCID：898604751625D00729



利用 **rosbridge** + **树莓派** ，试了一下有三种方式群控，依次是

1.  **树莓派x1 + 机器狗x3 + 外接无线网卡x1 + 蓝牙串口模块x1**
2.  **树莓派x1 + 机器狗x3 + 路由器x1 + 蓝牙串口模块x1**
3.  **树莓派x3 + 机器狗x3 + Zigeeb接收x3 + 红盒x1**

### i. 树莓派

![image-20260811161139389](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811161139641.webp)

1. 以树莓派作为热点（AP），供所有机器狗接入该网络；
2. 在树莓派端通过 Ping 命令检测网络连通性，同时借助 rosbridge 实现对机器狗的群控；
3. 树莓派额外接入蓝牙串口模块，用于接收 App 发送的指令协议；
4. 树莓派根据接收到的蓝牙指令协议，通过 rosbridge 向机器狗下发对应的群控协议，完成群控操作。

### ii. 路由器

![image-20260811161200611](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811161200867.webp)

1. 以路由器搭建热点（AP），构建统一网络，供树莓派与所有机器狗共同接入，形成群控所需的网络基础；
2. 树莓派在该网络中执行 Ping 命令，检测自身与机器狗的网络连通性，同时借助 rosbridge 组件，实现对机器狗的群控能力；
3. 为树莓派外接蓝牙串口模块，该模块专门用于接收 App 发送的指令协议，作为群控指令的输入来源；
4. 树莓派解析接收到的蓝牙指令协议后，通过 rosbridge 向所有接入网络的机器狗下发对应的群控协议，最终完成群控操作。

### iii. ZigBee

![image-20260811161219382](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811161219648.webp)

1. 树莓派与机器狗通过有线连接，以 Ping 检测连通性，借助 rosbridge 实现单控；
2. 树莓派配备 Zigbee 串口模块，用于接收指令；
3. 红盒终端（蓝牙转 Zigbee 网关）接收 App 蓝牙指令，转换为 Zigbee 信号群发；
4. 各底层单元（机器狗 + Zigbee 接收模块 + 树莓派）接收 Zigbee 指令，经树莓派解析后，通过 rosbridge 完成群控。



## b. 烧录系统

[Ubuntu 20.04.5 LTS (Focal Fossa)](https://cdimage.ubuntu.com/releases/20.04.5/release/)

使用的版本是 **[ubuntu-20.04.5-preinstalled-server-arm64+raspi.img.xz](https://cdimage.ubuntu.com/releases/20.04.5/release/)**，以及相关设置

[grid]
![image-20260811152429535](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811152430126.webp)
![image-20260811152443624](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811152443896.webp)
![image-20260811152456669](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811152456848.webp)
[/grid]

## c. 系统设置

- 集群组网存在两种可行方案
  - **软路由方案**：借助 USB 无线网卡配置软路由，由设备自身发射 WiFi 热点；

  - **硬件路由方案**：采用专用路由主板搭建独立硬件路由器。


准备一根**micro-hdmi线与屏幕**，然后连接线路。

### i. 内核锁定

防止内核更新，导致一些自己设置的驱动不能使用，需要锁定内核并且禁止更新

#### 1. 锁定内核

```bash
sudo lsof /var/lib/dpkg/lock
sudo kill -9 xxxx
```

```bash
# 查看当前内核版本（你这里是5.4.0-1069-raspi）
dog@ubuntu:~$ uname -r
5.4.0-1069-raspi

# 查找该内核对应的deb包名
dog@ubuntu:~$ dpkg -l | grep "5.4.0-1069-raspi"
ii  linux-headers-5.4.0-1069-raspi 5.4.0-1069.79                     arm64        Linux kernel headers for version 5.4.0 on ARMv8 SMP
ii  linux-image-5.4.0-1069-raspi   5.4.0-1069.79                     arm64        Linux kernel image for version 5.4.0 on ARMv8 SMP
ii  linux-modules-5.4.0-1069-raspi 5.4.0-1069.79                     arm64        Linux kernel extra modules for version 5.4.0 on ARMv8 SMP

# 锁定核心内核包（包含镜像、头文件、模块，覆盖所有内核组件）
dog@ubuntu:~$ sudo apt-mark hold linux-headers-5.4.0-1069-raspi linux-image-5.4.0-1069-raspi linux-modules-5.4.0-1069-raspi
linux-headers-5.4.0-1069-raspi set on hold.
linux-image-5.4.0-1069-raspi set on hold.
linux-modules-5.4.0-1069-raspi set on hold.

# 查看锁定的包
dog@ubuntu:~$ apt-mark showhold
linux-headers-5.4.0-1069-raspi
linux-image-5.4.0-1069-raspi
linux-modules-5.4.0-1069-raspi
```

#### 2. 禁止更新

彻底禁用自动更新（避免再次出现锁占用）

```bash
# 彻底卸载unattended-upgrades
sudo apt remove -y unattended-upgrades
# 禁止自动更新服务（双重保障）
sudo systemctl mask unattended-upgrades
```

禁用 Ubuntu 自动更新（杜绝后台升级），Ubuntu 默认开启unattended-upgrades服务，需彻底禁用：

```bash
# 停止自动更新服务
sudo systemctl stop unattended-upgrades
# 禁止开机自启
sudo systemctl disable unattended-upgrades
# 验证状态（显示disabled即成功）
sudo systemctl status unattended-upgrades
```

### ii. ROS安装

```bash
# 鱼香ROS 一键安装
wget http://fishros.com/install -O fishros && . fishros
source <(wget -qO- http://fishros.com/install)
```

连接网络后，输入以上代码，依次按照提示选择，注意在安装以下选项时，选择ROS１与桌面安装

```bash
请选择你要安装的ROS版本名称(请注意ROS1和ROS2区别):
[1]:foxy(ROS2)
[2]:galactic(ROS2)
[3]:noetic(ROS1)
[4]:rolling(ROS2)
[0]:quit
请输入[]内的数字以选择:3
RUN Choose Task:[请输入括号内的数字]
请选择安装的具体版本(如果不知道怎么选,请选1桌面版):
[1]:noetic(ROS1)桌面版
[2]:noetic(ROS1)基础版(小)
[0]:quit
请输入[]内的数字以选择:1
```

> [!TIP]
>
> - **永久关闭桌面环境，恢复到 TTY**
>
>   ```bash
>   # 可以通过修改系统的默认运行级别来实现，将默认运行级别设置为多用户模式（文本模式），执行以下命令
>   sudo systemctl set-default multi-user.target
>                         
>   # 然后重启系统
>   sudo reboot
>                         
>   # 如果之后又想恢复到图形界面模式，可以执行以下命令
>   sudo systemctl set- default graphical.target
>   sudo reboot
>   ```

### iii. 设置自登录

上面设置了Wifi，但是开机上电后并没有连接上，接上屏幕看了一下，需要登录，所以设置以下自登录，开机上电后直接登录。

**使用`login`命令配合管道自动输入密码（密码明文风险）**，通过`pipe`将密码 “喂” 给登录流程，需要借助`expect`工具。

1. 安装`expect`：
   ```bash
   sudo apt update
   sudo apt install expect -y
   ```
2. 创建自动登录脚本（如`/usr/local/bin/autologin.sh`）：
   ```bash
   sudo nano /usr/local/bin/autologin.sh
   ```
   
   写入内容（`your_password`\`your_username`  实际用户名与密码）：

   ```bash
   #!/usr/bin/expect -f
   spawn login
   expect "Username:"
   send "your_username\r"
   expect "Password:"
   send "your_password\r"
   interact
   ```

   ```bash
   #!/usr/bin/expect -f
   spawn login
   expect "Username:"
   send "dog\r"
   expect "Password:"
   send "dog\r"
   interact
   ```

   

   保存后添加执行权限：

   ```bash
   sudo chmod +x /usr/local/bin/autologin.sh
   ```

3. 修改`getty`服务配置，调用该脚本：
   ```bash
   sudo nano /etc/systemd/system/getty.target.wants/getty@tty1.service
   ```

   将`ExecStart`行替换为：

   ```bash
   ExecStart=-/sbin/agetty -n -l /usr/local/bin/autologin.sh %I $TERM
   ```

   （`-n`：不显示登录提示符；`-l`：指定登录脚本）

4. 重启生效：
   ```bash
   sudo systemctl daemon-reload && sudo reboot
   ```

还有一种方法，但是这种的话怕以后**dog用户**下的自动脚本不执行。

[【Linux运维】Ubuntu Server的无密码开机自动登录_ubuntu 串口终端 无密码登录-CSDN博客](https://blog.csdn.net/CharlesSimonyi/article/details/123189337)

### iv. 绑定串口

后面可能会用到（CH340），也许不用（使用树莓派自身的Tx\Rx）

#### 1.  查询串口设备

```bash
dog@ubuntu:~/HiveDg$ lsusb
Bus 003 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
Bus 002 Device 002: ID 2109:0817 VIA Labs, Inc. USB3.0 Hub             
Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
Bus 001 Device 005: ID 1a86:7523 QinHeng Electronics HL-340 USB-Serial adapter
Bus 001 Device 003: ID 0bda:c811 Realtek Semiconductor Corp. 
Bus 001 Device 007: ID 0d8c:0014 C-Media Electronics, Inc. Audio Adapter (Unitek Y-247A)
Bus 001 Device 009: ID 1e0e:9011 Qualcomm / Option 
Bus 001 Device 006: ID 2109:2817 VIA Labs, Inc. USB2.0 Hub
Bus 001 Device 002: ID 2109:3431 VIA Labs, Inc. Hub
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
```

#### 2.  创建 udev 并添加规则

```bash
sudo nano /etc/udev/rules.d/99-usb-serial.rules
```

```bash
# 绑定 HL-340 串口到 ttyCH340USB0
SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", SYMLINK+="ttyCH340USB0", MODE="0666"
```

- `SUBSYSTEM=="tty"`：指定设备类型为串口
- `ATTRS{idVendor}=="1a86"`：匹配厂商 ID
- `ATTRS{idProduct}=="7523"`：匹配产品 ID
- `SYMLINK+="ttyUSB0"`：创建符号链接到 `/dev/ttyUSB0`
- `MODE="0666"`：赋予读写权限

#### 3.  生效规则

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

### v. 其他配置

#### 1. 字体乱码

在 MobaXterm 终端执行main_ui.py时会出现中文显示乱码问题，解决思路为将宋体粗体SIMSUNB.TTF安装至 Linux 系统全局字体目录，使系统完整识别中文字体（仅程序内加载字体无法解决终端渲染乱码）。

**字体文件说明**

1. 推荐字体：SIMSUNB.TTF；也可选用 Windows 自带SimHei黑体等任意中文字体
2. Windows 系统字体存放路径：C:\Windows\Fonts

```bash
# 1. 新建自定义系统字体目录（目录不存在则自动创建）
sudo mkdir -p /usr/share/fonts/custom

# 2. 将字体文件拷贝至系统字体目录，二选一执行（按需替换字体文件路径）
sudo cp ~/HiveDg/fonts/SIMYOU.TTF /usr/share/fonts/custom/
# 备选命令
sudo cp /home/HiveBltDg/resources/fonts/SIMYOU.TTF /usr/share/fonts/custom/

# 3. 刷新系统字体缓存
sudo fc-cache -fv

# 4. 校验字体是否安装生效
fc-list | grep SIMYOU
```

#### **2. 运行环境依赖**

- **基础 Python 工具安装（Debian / 树莓派系统）**

  ```bash
  # 安装Python3-pip工具（树莓派/ Debian系系统）
  sudo apt install -y python3-pip
  
  # 升级pip到最新版（避免低版本pip安装包兼容问题，可以省略）
  pip3 install --upgrade pip -i https://pypi.tuna.tsinghua.edu.cn/simple
  ```

- **Python 第三方库安装**

  ```bash
  # 1、安装指定版本 roslibpy（1.8.1，核心模块完整）
  pip install roslibpy==1.8.1 -i https://pypi.tuna.tsinghua.edu.cn/simple
  
  # 2、强制升级 pillow
  #(1)依赖安装：需先安装PIL库，执行命令：pip install pillow
  #(2)Logo路径：确保logo1.png和logo2.png与代码文件在同一文件夹，或修改load_logo函数中的image_path为绝对路径（如"D:/logo1.png"）
  #(3)尺寸调整：可修改load_logo函数中的target_size参数（如(60,60)），调整Logo显示大小
  pip install --upgrade pillow --user -i https://pypi.tuna.tsinghua.edu.cn/simple
  
  # 3、添加 pygame 用于音乐播放
  pip install pygame -i https://pypi.tuna.tsinghua.edu.cn/simple
  ```

-  **ROS Noetic 工具包安装**

  ```bash
  # 安装 Noetic 版本的 actionlib_tools
  sudo apt-get install ros-$ROS_DISTRO-actionlib-tools  
  
  sudo apt install wireless-tools
  sudo apt install net-tools
  ```

#### 3. 别名

```bash
# 编辑 bash 配置文件（树莓派 Ubuntu 默认是~/.bashrc）：
nano ~/.bashrc

# 在文件末尾添加别名指令
alias dog_run='python3 HiveBltDg/main.py ui'
```

### vi. 热点配置

#### 1. USB网卡

**这个是使用USB网卡进行热点转发的系统配置，对应方案 [i. 树莓派](/posts/project/weilan-devq-02/#i-树莓派),RTL8811CU芯片(600M 无线网卡，2.4G/5G双频)**

##### a. AP模式

> [!NOTE]
>
> 参考链接：
>
> - [树莓派搭建WiFi热点-CSDN博客](https://blog.csdn.net/MidSummer411/article/details/118598025?ops_request_misc=%7B%22request%5Fid%22%3A%229b0824b3b5585250538c9840e74a18de%22%2C%22scm%22%3A%2220140713.130102334.pc%5Fall.%22%7D&request_id=9b0824b3b5585250538c9840e74a18de&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~rank_v31_ecpm-6-118598025-null-null.142^v102^control&utm_term=设置树莓派为ap热点&spm=1018.2226.3001.4187)
> - [树莓派3B创建WiFi热点_树莓派3b热点-CSDN博客](https://blog.csdn.net/fm0517/article/details/80939113)
>
> - [从零开始：树莓派共享 WiFi 秒变无线热点（树莓派路由器_树莓派开启开机自动共享wifi给其他设备-CSDN博客](https://blog.csdn.net/concefly/article/details/115369951?spm=1001.2101.3001.6650.2&utm_medium=distribute.pc_relevant.none-task-blog-2~default~OPENSEARCH~PaidSort-2-115369951-blog-80939113.235^v43^pc_blog_bottom_relevance_base7&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2~default~OPENSEARCH~PaidSort-2-115369951-blog-80939113.235^v43^pc_blog_bottom_relevance_base7&utm_relevant_index=4)
>
> - [hbaocr/rpi4-provisioning-ap-wifi](https://github.com/hbaocr/rpi4-provisioning-ap-wifi/tree/master)
>
> 利用 Github开源项目与一个外接网卡实现，这种方式实现最简单，开源项目地址
>
> ~~[oblique/create_ap](https://github.com/oblique/create_ap)~~
>
> [linux-wifi-hotspot](https://github.com/lakinduakash/linux-wifi-hotspot)

###### i. 安装 create_ap

- **源码编译安装步骤**

  ```bash
  # 拉取开源热点工具源码
  sudo git clone https://github.com/lakinduakash/linux-wifi-hotspot
  cd linux-wifi-hotspot/src/scripts
  
  # 安装编译基础工具make
  sudo apt install make -y
  # 安装gcc、g++编译套件，用于RTL8811CU/RTL8821CU/RTL8731AU无线网卡驱动编译
  sudo apt install gcc build-essential -y
  # 网络调试工具
  sudo apt install net-tools
  
  # 编译并安装工具至系统目录
  sudo make install
  ```

  执行 `sudo make install` 会自动完成以下部署动作：

  1. 复制主程序 `create_ap`、图形工具 `wihotspot` 至 `/usr/bin`
  2. 安装系统服务文件、bash 补全脚本、配置模板与说明文档至系统对应目录

- **安装校验与配置生效规则**

  1. 校验安装结果：终端执行 `create_ap -h`，输出帮助信息即代表安装完成；
  2. 配置更新规则：若修改 `create_ap` 核心配置文件，修改后必须重新执行 `sudo make install` 方可生效。

- **核心配置参数说明**

  配置文件关键参数推荐配置：

  - `WPA_VERSION=2`：仅启用 WPA2 模式，Intel 无线网卡存在兼容性问题，无法稳定识别 WPA3 混合模式；

  - `GATEWAY=10.0.0.1`：热点网关 IP，接入热点的设备以此作为路由出口；

  - `FREQ_BAND=5`：启用 5GHz 无线频段，传输速率更高。

  ```shell
  # 无线信道，default自动分配（2.4G默认信道1，5G默认信道36）；可手动填写2.4G：1/6/11，5G：36/40/44等
  CHANNEL=default
  
  # 热点网关地址，客户端默认路由出口
  GATEWAY=10.0.0.1
  
  # 无线加密协议：1=仅WPA，2=仅WPA2，1+2=WPA/WPA2混合
  WPA_VERSION=2
  
  # DNS是否读取/etc/hosts：0关闭，1开启
  ETC_HOSTS=0
  
  # 额外自定义hosts文件路径，留空不启用
  ADDN_HOSTS=
  
  # DHCP下发DNS，gateway为网关IP；也可填写公共DNS如8.8.8.8,114.114.114
  DHCP_DNS=gateway
  
  # 关闭内置DNS服务：0启用，1禁用
  NO_DNS=0
  
  # 完全关闭dnsmasq（DHCP+DNS一并关闭）：0启用，1禁用
  NO_DNSMASQ=0
  
  # DNS监听端口，留空自动分配
  DNS_PORT=
  
  # 是否隐藏SSID：0广播，1隐藏
  HIDDEN=0
  
  # MAC地址白名单过滤开关：0关闭，1开启
  MAC_FILTER=0
  
  # MAC白名单文件路径，仅MAC_FILTER=1时生效
  MAC_FILTER_ACCEPT=/etc/hostapd/hostapd.accept
  
  # 客户端隔离：0允许设备互访，1隔离所有接入终端
  ISOLATE_CLIENTS=0
  
  # 网络共享模式：nat地址转换、bridge桥接、none不转发外网
  SHARE_METHOD=nat
  
  # 802.11n高速2.4G协议：0关闭，1开启
  IEEE80211N=0
  
  # 802.11ac高速5G协议：0关闭，1开启
  IEEE80211AC=0
  
  # 2.4G 802.11n带宽配置
  HT_CAPAB='[HT40+]'
  
  # 5G 802.11ac VHT能力参数，留空自动适配
  VHT_CAPAB=
  
  # 无线驱动：通用nl80211；Realtek网卡需改为rtl871xdrv
  DRIVER=nl80211
  
  # 虚拟网卡开关：0支持同时连WiFi+开热点，1禁用虚拟接口
  NO_VIRT=0
  
  # 国家码（如CN），管控无线频率合规，留空自动识别
  COUNTRY=
  
  # 无线频段：2.4代表2.4GHz，5代表5GHz
  FREQ_BAND=5
  
  # 自定义热点MAC地址，留空使用网卡原生MAC
  NEW_MACADDR=
  
  # 后台守护进程：0前台运行，1后台运行
  DAEMONIZE=0
  
  # 守护进程PID存储路径，仅后台模式生效
  DAEMON_PIDFILE=
  
  # 守护进程日志路径，/dev/null代表丢弃日志
  DAEMON_LOGFILE=/dev/null
  
  # 熵值工具haveged开关：0自动启动，1关闭
  NO_HAVEGED=0
  
  # 认证方式：0明文密码，1使用64位十六进制PSK密钥
  USE_PSK=0
  ```

###### ii. 安装相关库

```bash
sudo apt-get install util-linux procps hostapd iproute2 iw haveged dnsmasq
sudo apt-get install -y network-manager
```

###### iii. USB无线网卡

插上网卡后,输入iwconfig , 一般wlan0是树莓派自带的wifi,用于接入外网, wlan1就是另外购买的usb网卡

> [!CAUTION]
>
> 若使用 **RTL8811CU**, **RTL8821CU** 和 **RTL8731AU** 网卡，需安装对应的网卡驱动，
>
> 下载地址：https://gitcode.com/Universal-Tool/c06a0
>
> 存在了**123网盘**中一份，结构目录大概是这样
>
> ![image-20260811163255147](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811163255427.webp)
>
> 结构目录大概是这样
>
> ```bash
> # 可能缺少 make 
> sudo apt install make -y  
> # 可能缺少 gcc\g++，这个是用于编译 RTL8811CU, RTL8821CU 和 RTL8731AU 网卡驱动使用的
> sudo apt install gcc build-essential -y
> sudo apt install net-tools
> ```
>
> 
>
> 进入驱动目录，执行以下命令编译安装：
>
> ```bash
> dog@ubuntu: cd Linux-600M-20.04/
> dog@ubuntu: make
> 
> CC [M]  /home/Linux-600M-20.04/core/rtw_mp.o
> LD [M]  /home/Linux-600M-20.04/8821cu.o
> Building modules, stage 2.
> MODPOST 1 modules
> CC [M]  /home/Linux-600M-20.04/8821cu.mod.o
> LD [M]  /home/Linux-600M-20.04/8821cu.ko
> make[1]: Leaving directory '/usr/src/linux-headers-5.4.0-1129-raspi'
> 
> dog@ubuntu: sudo make install
> ```
>
> 
>
> 设置系统自动加载驱动，现在重启之后使用 **`ifconfig`**,是查询不到网卡的
>
> ```bash
> # 1、临时加载 加载目录中的驱动
> sudo insmod /home/dog/Linux-600M-20.04/8821cu.ko
> ```
>
> ```shell
> # 2、设置开机自动加载驱动
> # 将驱动模块复制到系统默认模块目录（与当前内核匹配）
> sudo cp /home/dog/Linux-600M-20.04/8821cu.ko /lib/modules/$(uname -r)/kernel/drivers/net/wireless/
> # 更新模块依赖索引
> sudo depmod -a
> # 添加模块名到自动加载配置文件
> echo "8821cu" | sudo tee -a /etc/modules
> ```
>
> 重新启动设备
>
> 重启系统后,**验证驱动加载状态**，通过以下命令确认驱动是否自动加载：
>
> ```bash
> lsmod | grep 8821cu  # 若输出包含 "8821cu"，说明加载成功
> iwlist scan          # 扫描附近的 WiFi 网络，验证网卡功能正常
> ```
>

###### iv. 开机自启动

**创建ap开启/关闭**

```bash
# 密码要8位,开启AP
sudo create_ap wlan1 eth0 热点名 密码

# 关闭AP
create_ap --stop wlan1
```

要将 `create_ap` 命令设置为开机自启动，可以通过 **systemd 服务** 实现，步骤如下：

- **1. 创建 systemd 服务文件**

  创建一个名为 `create_ap.service` 的服务文件

  ```bash
  sudo nano /etc/systemd/system/create_ap.service
  ```

- **2. 写入服务配置**

  将以下内容粘贴到文件中（注意替换你的热点参数）

  ```ini
  [Unit]
  Description=Create AP Service
  After=network.target
  
  [Service]
  Type=simple
  ExecStart=/usr/bin/create_ap wlan1 eth0 Pi-Dog 12345678  
  Restart=always
  RestartSec=5
  User=root
  
  [Install]
  WantedBy=multi-user.target
  ```

  - `ExecStart` 后的路径和参数需与你的实际命令一致
  - `Restart=always` 确保服务意外停止后自动重启

- **3. 启用并启动服务**

  ```bash
  # 重新加载系统服务配置
  sudo systemctl daemon-reload
  
  # 设置开机自启动
  sudo systemctl enable create_ap.service
  
  # 立即启动服务
  sudo systemctl start create_ap.service
  ```

- **4. 验证配置**

  ```bash
  # 检查是否已设置自启动
  sudo systemctl is-enabled create_ap.service
  
  # 查看服务状态
  sudo systemctl status create_ap.service
  ```

  > [!CAUTION]
  >
  > 注意事项
  >
  > - 如果你的 `create_ap` 不在 `/usr/bin` 目录，可以用 `which create_ap` 命令查找实际路径并替换
  > - 重启树莓派后测试是否自动生效：`sudo reboot`
  > - 如需修改热点参数，直接编辑服务文件后重新加载：`sudo systemctl daemon-reload && sudo systemctl restart create_ap.service`

###### v. 查看连接设备IP

```bash
ps aux | grep dnsmasq

cat /tmp/create_ap.wlan1.conf.5zScXC6R/dnsmasq.leases
```

还可以通过 **sudo create_ap --list-clients wlan1** 命令实时查看

```bash
dog@ubuntu:~$ sudo create_ap --list-clients wlan1
MAC                  IP                 Hostname
54:78:c9:51:88:78    *                  *
dog@ubuntu:~$ sudo create_ap --list-clients wlan1
MAC                  IP                 Hostname
a2:20:b3:bf:8c:38    10.0.0.5           K-ON
54:78:c9:51:88:78    *                  *
dog@ubuntu:~$ sudo create_ap --list-clients wlan1
MAC                  IP                 Hostname
54:78:c9:51:88:78    *                  *
dog@ubuntu:~$
```

修改一下设置，就可以实现 **sudo create_ap --list-clients wlan1** 不输入密码直接执行

```bash
sudo visudo

# 在文件最后一行填入
dog ALL=(ALL) NOPASSWD: /usr/bin/create_ap
```

###### vi. 查看创建信道与频段

```bash
dog@pi-dog:~$ iwlist wlan1 channel | grep "Current Frequency"

Current Frequency:5.18 GHz (Channel 36)
```

##### b. 固定网口IP

无线网卡创建AP后，固定连他设备的IP地址。

###### i. 查询MAC地址

```bash
dog@pi-dog:~$ ps aux | grep dnsmasq
nobody       961  0.0  0.0   7092  2604 ?        S    13:43   0:00 dnsmasq 
-C /tmp/create_ap.wlan1.conf.QswbthKO/dnsmasq.conf 
-x /tmp/create_ap.wlan1.conf.QswbthKO/dnsmasq.pid 
-l /tmp/create_ap.wlan1.conf.QswbthKO/dnsmasq.leases 
-p 5353
dog        13039  0.0  0.0   7696   668 pts/1    S+   14:11   0:00 grep --color=auto dnsmasq

dog@pi-dog:~$ sudo cat /tmp/create_ap.wlan1.conf.QswbthKO/dnsmasq.leases
1758433628 f4:a4:75:bc:14:9d 10.0.0.39 DESKTOP-KTL292C 01:f4:a4:75:bc:14:9d
```

可以得知 **DESKTOP-KTL292C** 设备的MAC地址是 **f4:a4:75:bc:14:9d**

###### ii. 修改服务文件，加载静态规则

```
sudo nano /etc/systemd/system/create_ap.service
```

```ini
[Unit]
Description=Create AP Service
After=network.target

[Service]
Type=simple
# 用 --dhcp-hosts 把 MAC,IP 带进去
ExecStart=/usr/bin/create_ap \
          --config /etc/create_ap.conf \
          --dhcp-hosts "f4:a4:75:bc:14:9d,10.0.0.100" 
KillSignal=SIGINT
Restart=on-failure
RestartSec=5
KillMode=control-group

[Install]
WantedBy=multi-user.target
```

多台设备(9台) 中间加空格

```ini
[Unit]
Description=Create AP Service
After=network.target

[Service]
Type=simple
# 用 --dhcp-hosts 把 MAC,IP 带进去
ExecStart=/usr/bin/create_ap \
          --config /etc/create_ap.conf \
          --dhcp-hosts "54:78:c9:51:88:78,10.0.0.51 54:78:c9:52:67:1c,10.0.0.52 54:78:c9:51:c8:90,10.0.0.53 40:d9:5a:1e:8a:b6,10.0.0.54 40:d9:5a:1e:fa:90,10.0.0.55 40:d9:5a:1e:7b:2e,10.0.0.56 40:d9:5a:1f:0a:60,10.0.0.57 40:d9:5a:1f:2a:3a,10.0.0.58 40:d9:5a:1e:7b:be,10.0.0.59"
KillSignal=SIGINT
Restart=on-failure
RestartSec=5
KillMode=control-group

[Install]
WantedBy=multi-user.target
```

**IP 冲突问题**：固定 IP 需在 `10.0.0.2~10.0.0.254` 范围内（避免与网关 `10.0.0.1` 冲突），且确保未被其他设备占用。

修改 `/etc/create_ap.conf` 文件

```bash
sudo nano /etc/create_ap.conf
```

- **2.4G 配置**

  ```ini
  CHANNEL=6          
  GATEWAY=10.0.0.1
  WPA_VERSION=2
  ETC_HOSTS=0
  DHCP_DNS=gateway
  NO_DNS=0
  NO_DNSMASQ=0
  HIDDEN=0
  MAC_FILTER=0
  MAC_FILTER_ACCEPT=/etc/hostapd/hostapd.accept
  ISOLATE_CLIENTS=0
  SHARE_METHOD=nat
  IEEE80211N=1    
  IEEE80211AC=0      
  IEEE80211AX=0
  HT_CAPAB=[HT20]    
  VHT_CAPAB=
  DRIVER=nl80211
  NO_VIRT=0
  COUNTRY=CN         
  FREQ_BAND=2.4      
  NEW_MACADDR=
  DAEMONIZE=0
  NO_HAVEGED=0
  WIFI_IFACE=wlan1
  INTERNET_IFACE=eth0
  SSID=Rpi-Dog
  PASSPHRASE=12345678
  USE_PSK=0
  DHCP_HOSTS=
  ```

- **5G 配置**

  ```ini
  CHANNEL=36
  GATEWAY=10.0.0.1
  WPA_VERSION=2
  ETC_HOSTS=0
  DHCP_DNS=gateway
  NO_DNS=0
  NO_DNSMASQ=0
  HIDDEN=0
  MAC_FILTER=0
  MAC_FILTER_ACCEPT=/etc/hostapd/hostapd.accept
  ISOLATE_CLIENTS=0
  SHARE_METHOD=nat
  IEEE80211N=0
  IEEE80211AC=0
  IEEE80211AX=0
  HT_CAPAB=[HT40+]
  VHT_CAPAB=
  DRIVER=nl80211
  NO_VIRT=0
  COUNTRY=
  FREQ_BAND=5
  NEW_MACADDR=
  DAEMONIZE=0
  NO_HAVEGED=0
  WIFI_IFACE=wlan1
  INTERNET_IFACE=eth0
  SSID=Rpi-Dog-5G
  PASSPHRASE=12345678
  USE_PSK=0
  DHCP_HOSTS=
  ```

###### iii. 重启服务，验证固定 IP

```ini
# 1. 重新加载服务配置
sudo systemctl daemon-reload

# 2. 重启 create_ap（会触发 dnsmasq 重新加载规则）
sudo systemctl restart create_ap

# 3. 让目标设备重新连接热点（断开后再连）

# 4. 查看新的租约，确认固定 IP 是否生效
sudo cat /tmp/create_ap.wlan1.conf.xxxxxxx/dnsmasq.leases
```

若输出中该设备的 IP 变为 `10.0.0.100`，说明固定 IP 配置成功；后续该设备每次连接热点，都会自动获取此固定 IP。

```ini
# 自己电脑	固定IP为：10.0.0.100
f4:a4:75:bc:14:9d  DESKTOP-KTL292C   

# 公司电脑	固定IP为：10.0.0.101
00:21:6b:f2:8e:8d  DESKTOP-L5CON59

# 机器狗1  固定IP为：10.0.0.51
54:78:c9:51:88:78  sport 

# 机器狗2  固定IP为：10.0.0.52
54:78:c9:52:67:1c  sport

# 机器狗3  固定IP为：10.0.0.53
54:78:c9:51:c8:90  sport 

# 机器狗4  固定IP为：10.0.0.54
40:d9:5a:1e:8a:b6  sport

# 机器狗5  固定IP为：10.0.0.55
40:d9:5a:1e:fa:90  sport

# 机器狗6  固定IP为：10.0.0.56
40:d9:5a:1e:7b:2e  sport

# 机器狗7  固定IP为：10.0.0.57
40:d9:5a:1f:0a:60  sport

# 机器狗8  固定IP为：10.0.0.58
40:d9:5a:1f:2a:3a  sport

# 机器狗9  固定IP为：10.0.0.59
40:d9:5a:1e:7b:be  sport  
```

##### c. 设置白名单

这个就不抄录了，若后面有需要可以查看原版的文档，在文章表头有PDF链接。

##### d. 设置黑名单

这个就不抄录了，若后面有需要可以查看原版的文档，在文章表头有PDF链接。

#### 2. 路由器核心板

**这个是使用路由器核心板模块就进行热点转发的系统配置,对应方案 [ii. 路由器](/posts/project/weilan-devq-02/#ii-路由器)**

[grid]
![image-20260811165103718](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811165104407.webp)
![image-20260811165044142](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811165045321.webp)
[/grid]

线序对应的是网线的八根线中的四根（橙白、橙、绿白、绿），分别是1、2、3、6。

[grid]
![image-20260811165144924](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811165145171.webp)
![image-20260811165155725](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811165155987.webp)
[/grid]

大概连接测试线路

![image-20260811165242535](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811165243205.webp)

因为外接AP模块是没有网络的，所以在接树莓派后需要网线共享网络给它。

##### i. 树莓派端设置

- **配置静态IP（eth0）**

  ```bash
  sudo nano /etc/netplan/50-cloud-init.yaml
  ```

  ```yaml
  network:
      version: 2
      renderer: networkd
  
      ethernets:
          # 接路由器AP → 静态IP 10.0.0.1
          eth0:
              dhcp4: false
              addresses:
                  - 10.0.0.1/24        # 主网关
              optional: true
  
          # 4G上网卡 → 自动获取
          eth1:
              dhcp4: true
              optional: true
  
      wifis:
          # WiFi备用（可选）
          wlan0:
              access-points:
                  ESTEAM_5G:
                      hidden: true
                      password: "Ysd13579"
              dhcp4: true
              optional: true
  ```

  ```bash
  # 应用配置
  sudo netplan apply
  
  # 确认IP生效
  ip addr show eth0 | grep inet
  ```

- **安装并配置DHCP服务器**

  - 安装dnsmasq

    ```bash
    sudo apt update
    sudo apt install dnsmasq -y
    ```

  - 编辑内容

    ```bash
    sudo nano /etc/dnsmasq.conf
    ```

    ```bash
    # 基础配置
    interface=eth0
    bind-interfaces
    
    # 普通DHCP范围（100~200）
    dhcp-range=10.0.0.100,10.0.0.200,255.255.255.0,12h
    
    # ========== 黑名单（完全禁止） ==========
    dhcp-host=de:ad:be:ef:00:01,ignore
    dhcp-host=ca:fe:ba:be:00:02,ignore
    
    # ========== 白名单固定IP（9个设备） ==========
    dhcp-host=54:78:c9:51:88:78,10.0.0.51
    dhcp-host=54:78:c9:52:67:1c,10.0.0.52
    dhcp-host=54:78:c9:51:c8:90,10.0.0.53
    dhcp-host=40:d9:5a:1e:8a:b6,10.0.0.54
    dhcp-host=40:d9:5a:1e:fa:90,10.0.0.55
    dhcp-host=40:d9:5a:1e:7b:2e,10.0.0.56
    dhcp-host=40:d9:5a:1f:0a:60,10.0.0.57
    dhcp-host=40:d9:5a:1f:2a:3a,10.0.0.58
    dhcp-host=40:d9:5a:1e:7b:be,10.0.0.59
    
    # 网关和DNS
    dhcp-option=3,10.0.0.1
    dhcp-option=6,10.0.0.1
    server=8.8.8.8
    server=114.114.114.114
    
    log-queries
    log-dhcp
    ```

  - 启动服务

    ```bash
    sudo systemctl start dnsmasq
    sudo systemctl enable dnsmasq
    ```


- **创建网络共享脚本**

  ```bash
  sudo nano /usr/local/bin/netshare
  ```

  ```bash
  #!/bin/bash
  
  # 网络共享切换脚本
  # 默认：4G (eth1)
  # 参数：wifi → 切换WiFi
  
  echo "$(date): netshare started" >> /tmp/netshare.log
  sleep 5   # 等待网络稳定
  
  MODE="4g"
  if [ $# -ge 1 ]; then
      MODE="$1"
  fi
  
  echo "🔄 正在配置网络共享..."
  
  # 确保eth0是静态IP 10.0.0.1
  ip addr flush dev eth0 2>/dev/null
  ip addr add 10.0.0.1/24 dev eth0
  ip link set eth0 up
  
  # 清空旧iptables规则
  iptables -t nat -F POSTROUTING
  iptables -F FORWARD
  echo 1 > /proc/sys/net/ipv4/ip_forward
  
  # 配置NAT
  if [ "$MODE" = "wifi" ]; then
      iptables -t nat -A POSTROUTING -o wlan0 -j MASQUERADE
      iptables -A FORWARD -i eth0 -o wlan0 -j ACCEPT
      iptables -A FORWARD -i wlan0 -o eth0 -m state --state RELATED,ESTABLISHED -j ACCEPT
      echo "✅ 已切换：WiFi 共享 → AP"
  else
      iptables -t nat -A POSTROUTING -o eth1 -j MASQUERADE
      iptables -A FORWARD -i eth0 -o eth1 -j ACCEPT
      iptables -A FORWARD -i eth1 -o eth0 -m state --state RELATED,ESTABLISHED -j ACCEPT
      echo "✅ 已切换：4G 共享 → AP（默认）"
  fi
  
  # 允许本地回环
  iptables -A INPUT -i lo -j ACCEPT
  iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
  
  # 保存规则
  netfilter-persistent save >/dev/null 2>&1 || true
  
  # 重启dnsmasq
  systemctl restart dnsmasq 2>/dev/null || service dnsmasq restart 2>/dev/null
  
  echo ""
  echo "📊 AP模式配置："
  echo "─────────────────────────────"
  echo "🖥️  树莓派网关: 10.0.0.1"
  echo "📶 DHCP范围: 10.0.0.50 ~ 10.0.0.200"
  echo ""
  echo "🧪 测试命令："
  echo "   ssh pi@10.0.0.1"
  echo "   cat /var/lib/misc/dnsmasq.leases"
  echo "─────────────────────────────"
  ```

  ```bash
  sudo chmod +x /usr/local/bin/netshare
  ```

- **设置开机自动启动**

  创建服务文件 `/etc/systemd/system/netshare.service`：

  ```bash
  sudo nano /etc/systemd/system/netshare.service
  ```

  ```ini
  [Unit]
  Description=Network sharing setup
  After=network-online.target
  Wants=network-online.target
  
  [Service]
  Type=oneshot
  ExecStart=/usr/local/bin/netshare
  RemainAfterExit=yes
  
  [Install]
  WantedBy=multi-user.target
  ```

  ```bash
  # 启用并启动
  sudo systemctl daemon-reload
  sudo systemctl enable netshare.service
  sudo systemctl start netshare.service
  
  # 查看服务状态
  sudo systemctl status netshare.service
  
  # 查看详细日志
  sudo journalctl -u netshare.service
  ```

- **NetworkManager 忽略 eth0**

  执行以下命令创建配置文件，明确告知 NetworkManager 不要管理 eth0 接口：

  ```bash
  sudo bash -c 'cat > /etc/NetworkManager/conf.d/99-unmanaged-eth0.conf <<EOF
  [keyfile]
  unmanaged-devices=interface-name:eth0
  EOF'
  ```

  重启 NetworkManager 使配置生效：

  ```bash
  sudo systemctl restart NetworkManager
  ```

  验证 eth0 是否已不受 NetworkManager 管理：

  ```bash
  dog@ubuntu:~$ nmcli device status
  DEVICE  TYPE      STATE        CONNECTION 
  eth1    ethernet  connected    eth1       
  wlan0   wifi      unavailable  --         
  eth0    ethernet  unmanaged    --         
  lo      loopback  unmanaged    --
  ```

  输出中 eth0 的状态应显示为 **"unmanaged"**。


##### ii. 路由器核心板端

> [!NOTE]
>
> 固件SDK相关资料
>
> 1:本文档适用是华思飞机型部分SDK源代码,型号如下：
>
> SHF280/SHF281/SHF283/SHF285/SHF386/WS1209/WS1208V2/WH3000/WH3000PRO/WS3006等机型。
>
> 2：源码采用LEDE库，不同机型编译不同型号的配置文件；其中SHF280/SHF281/SHF283/SHF285等MT7628型号机型选择编译源码SHF283配置文件即可；
>
> WS1209/WS1208V2机型选择编译WS1208V2配置文件，其他机型对应设备硬件型号；
>
> LEDE源码下载地址：https://github.com/coolsnowwolf/lede
>
> 
>
> 1: This document applies to the SDK source code for the Huasi aircraft model, with the following models:
>
> Models such as SHF280/SHF281/SHF283/SHF285/SHF386/WS1209/WS1208V2/WH3000/WH3000PRO/WS3006.
>
> 2: The source code utilizes the LEDE library, and configuration files for different models are compiled for various device types; for MT7628 models such as SHF280/SHF281/SHF283/SHF285, the SHF283 configuration file is the appropriate choice for compiling the source code;
>
> For WS1209/WS1208V2 models, select and compile the WS1208V2 configuration file. For other models, use the corresponding device hardware model;
>
> LEDE source code download link: https://github.com/coolsnowwolf/lede
>
> ![image-20260811170438333](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811170438593.webp)
>
> 还有其他固件的的使用说明书，可以参考其中内容
>
> **[WH3000系统说明书V1.2.1.pdf](https://1831996731.share.123pan.cn/123pan/wdzVjv-Dodvd)** 

```ini
dog@ubuntu:~$ cat /var/lib/misc/dnsmasq.leases
1774381214 a2:20:b3:bf:8c:38 10.0.0.133 K-ON 01:a2:20:b3:bf:8c:38
1774378922 58:23:bc:00:45:29 10.0.0.158 WE2126 01:58:23:bc:00:45:29
1774381373 a0:47:d7:62:f9:43 10.0.0.103 DESKTOP-L5CON59 01:a0:47:d7:62:f9:43
dog@ubuntu:~$ cat /var/lib/misc/dnsmasq.leases
1774381214 a2:20:b3:bf:8c:38 10.0.0.133 K-ON 01:a2:20:b3:bf:8c:38
1774378922 58:23:bc:00:45:29 10.0.0.158 WE2126 01:58:23:bc:00:45:29
1774381373 a0:47:d7:62:f9:43 10.0.0.103 DESKTOP-L5CON59 01:a0:47:d7:62:f9:43
dog@ubuntu:~$ cat /var/lib/misc/dnsmasq.leases
1774381214 a2:20:b3:bf:8c:38 10.0.0.133 K-ON 01:a2:20:b3:bf:8c:38
1774378922 58:23:bc:00:45:29 10.0.0.158 WE2126 01:58:23:bc:00:45:29
1774381373 a0:47:d7:62:f9:43 10.0.0.103 DESKTOP-L5CON59 01:a0:47:d7:62:f9:43
dog@ubuntu:~$ cat /var/lib/misc/dnsmasq.leases
1774381214 a2:20:b3:bf:8c:38 10.0.0.133 K-ON 01:a2:20:b3:bf:8c:38
1774378922 58:23:bc:00:45:29 10.0.0.158 WE2126 01:58:23:bc:00:45:29
1774381373 a0:47:d7:62:f9:43 10.0.0.103 DESKTOP-L5CON59 01:a0:47:d7:62:f9:43
dog@ubuntu:~$ cat /var/lib/misc/dnsmasq.leases
1774381214 a2:20:b3:bf:8c:38 10.0.0.133 K-ON 01:a2:20:b3:bf:8c:38
1774378922 58:23:bc:00:45:29 10.0.0.158 WE2126 01:58:23:bc:00:45:29
1774381373 a0:47:d7:62:f9:43 10.0.0.103 DESKTOP-L5CON59 01:a0:47:d7:62:f9:43
dog@ubuntu:~$ cat /var/lib/misc/dnsmasq.leases
1774381214 a2:20:b3:bf:8c:38 10.0.0.133 K-ON 01:a2:20:b3:bf:8c:38
1774378922 58:23:bc:00:45:29 10.0.0.158 WE2126 01:58:23:bc:00:45:29
1774381373 a0:47:d7:62:f9:43 10.0.0.103 DESKTOP-L5CON59 01:a0:47:d7:62:f9:43
```

-   **初始默认设置**

  |     **IP 设置**     |                          **默认值**                          |
  | :-----------------: | :----------------------------------------------------------: |
  | **管理员名称/密码** |                            admin                             |
  |     **IP 地址**     |                         192.168.1.1                          |
  |    **子网掩码**     |                        255.255.255.0                         |
  |    **默认名称**     |                             ASUS                             |
  |    **默认密码**     |                          1234567890                          |
  | **Reset（重置）键** | 如果忘记密码，按住设备上的 “Reset（重置）”按钮 10 -15秒钟并松开，即可恢复初始管理 |

-   **修改SSID与密码**

  网页登录 `http://192.168.1.1`，修改内容如下

  - SSID：`Rpi-Dog-5G`

  - WPA-PSK 密钥：`12345678`


  ![image-20260811171009380](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811171009684.webp)

- **关闭 DHCP服务器**

  - 登录 `http://192.168.1.1`
  - **DHCP服务器：禁用**

  ![image-20260811171042489](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811171042722.webp)

  最后**应用本页面设置**

- **改为AP模式**

  1. **系统管理 → 操作模式**
  2. 选择 **Access Point(无线存取点)**
  3. 保存并重启

  ![image-20260811171123703](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811171124011.webp)

- **设置静态 IP**

  - 获取IP自动？：关闭
  - IP地址：10.0.0.2
  - 默认网关：10.0.0.1
  - DNS 服务器1：10.0.0.1

  ![image-20260811171152191](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811171152459.webp)

  ```bash
  dog@ubuntu:~$ arp -n | grep -v incomplete
  Address                  HWtype  HWaddress           Flags Mask            Iface
  10.0.0.133               ether   a2:20:b3:bf:8c:38   C                     eth0
  10.0.0.103               ether   a0:47:d7:62:f9:43   C                     eth0
  192.168.0.107            ether   00:21:6b:f2:8e:8d   C                     wlan0
  10.0.0.2                 ether   58:23:bc:00:45:29   C                     eth0
  192.168.0.1              ether   00:74:d1:d1:d1:d1   C                     eth1
  192.168.0.1              ether   34:f7:16:9f:81:40   C                     wlan0
  dog@ubuntu:~$ sudo tail -f /var/log/syslog | grep dnsmasq
  [sudo] password for dog: 
  Mar 24 16:11:18 ubuntu dnsmasq[892]: reply honor.zuimeitianqi.com is 39.134.75.61
  Mar 24 16:11:18 ubuntu dnsmasq[892]: reply honor.zuimeitianqi.com is 39.136.162.162
  Mar 24 16:11:19 ubuntu dnsmasq[892]: query[A] metrics-basecloud-drcn.dt.hihonorcloud.com from 10.0.0.133
  Mar 24 16:11:19 ubuntu dnsmasq[892]: forwarded metrics-basecloud-drcn.dt.hihonorcloud.com to 114.114.114.114
  Mar 24 16:11:19 ubuntu dnsmasq[892]: reply metrics-basecloud-drcn.dt.hihonorcloud.com is 111.13.88.251
  Mar 24 16:11:19 ubuntu dnsmasq[892]: query[A] nexus.officeapps.live.com from 10.0.0.103
  Mar 24 16:11:19 ubuntu dnsmasq[892]: cached nexus.officeapps.live.com is <CNAME>
  Mar 24 16:11:19 ubuntu dnsmasq[892]: forwarded nexus.officeapps.live.com to 114.114.114.114
  Mar 24 16:11:19 ubuntu dnsmasq[892]: reply nexus.officeapps.live.com is 13.107.213.50
  Mar 24 16:11:19 ubuntu dnsmasq[892]: reply nexus.officeapps.live.com is 13.107.246.50
  ^C
  dog@ubuntu:~$ cat /var/lib/misc/dnsmasq.leases
  1774383067 a2:20:b3:bf:8c:38 10.0.0.133 K-ON 01:a2:20:b3:bf:8c:38
  1774378922 58:23:bc:00:45:29 10.0.0.158 WE2126 01:58:23:bc:00:45:29
  1774381373 a0:47:d7:62:f9:43 10.0.0.103 DESKTOP-L5CON59 01:a0:47:d7:62:f9:43
  dog@ubuntu:~$
  ```

  ```bash
  # 最简单（推荐）
  sudo arp-scan -l
  
  # 它会直接显示：
  # IP
  # MAC
  # 设备名称 / 厂商
  # 这是 Ubuntu 上最常用、最清晰的查看局域网设备的命令。
  ```

## d. 方案执行

最终只没有使用 **ZigBee** 方案

> [!TIP]
>
> **~~树莓派蓝牙如何使用 (Ubuntu 20.04 Server)~~**
>
> 放弃使用树莓派板载蓝牙这个方案，直接使用USB-蓝牙模块，以后如果用的话可以参考下面的。
>
> [树莓派 Ubuntu 20.04 Server 模拟 HC-02 经典蓝牙模块完整手册.md](file\树莓派 Ubuntu 20.04 Server 模拟 HC-02 经典蓝牙模块完整手册.md) 
>
> [树莓派模拟 HC-02 经典蓝牙 SPP 场景的替代方案.md](file\树莓派模拟 HC-02 经典蓝牙 SPP 场景的替代方案.md) 
>
> [RPI 4B – Bluetooth unavailable on Ubuntu server 20.04 | 伪斜杠青年](https://i.lckiss.com/?p=8386)
>
> [用树莓派玩转蓝牙 - Vamei - 博客园](https://www.cnblogs.com/vamei/p/6753531.html)
>
> [树莓派的蓝牙通讯（bluez、gattlib）_树莓派和imu蓝牙通信-CSDN博客](https://blog.csdn.net/weixin_45467056/article/details/105778284?spm=1001.2101.3001.6650.2&utm_medium=distribute.pc_relevant.none-task-blog-2~default~BlogCommendFromBaidu~Rate-2-105778284-blog-118416477.235^v43^pc_blog_bottom_relevance_base3&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2~default~BlogCommendFromBaidu~Rate-2-105778284-blog-118416477.235^v43^pc_blog_bottom_relevance_base3&utm_relevant_index=5)
>
> 这个暂时没有弄明白

### i. 逻辑图解

这个只是列出USB网卡的，但是路由器核心板版本一样逻辑

![image-20260811171608081](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811171608379.webp)

### ii. 蓝牙通信协议

本节介绍基于蓝牙链路对接手机 APP 控制方案所使用的通信协议规范。

#### 1. 需求分析

  功能包括：

- 接收 APP 的查询命令
- 使用 `create_ap -list-clent wlan1` 命令查询在线设备
- 将查询结果与预定义的机器人列表比对（格式如`[[robot1,54:78:c9:51:88:78,10.0.0.51],[robot2,54:98:c1:51:88:78,10.0.0.52]]`）
- 向 APP 返回在线的机器人信息
- 接收 APP 选择连接的机器人指令，并进行连接
- 连接成功 / 失败都向 APP 返回状态
- 接收 APP 发送的动作指令，并执行对应动作
- 最多支持 9 台设备



**方案思路：**

1. **串口通信设置**：
   - 使用 `pyserial` 库处理串口通信
   - 设置合适的波特率、超时等参数
2. **协议设计**：
   - 需要设计简单可靠的通信协议
     - 包含命令类型、设备 ID、数据长度、数据内容、校验等部分
3. **命令类型**：
   - 登录树莓派
    - 查询在线设备
      - 连接指定设备
      - 执行动作指令
     - 断开连接
     - 状态反馈
4. **整合现有代码**：
   - 复用`RobotConnectionManager`进行机器人连接管理
   - 复用`ActionExecutor`执行动作
     - 复用`action_map.py`中的动作映射
5. **设备在线检测**：
   - 使用`subprocess`调用`create_ap -list-clent wlan1`命令
    - 解析输出结果，提取在线设备的 MAC 地址
   - 与预定义列表比对，确定在线机器人



#### 2. 协议定义

![image-20260811172229774](https://vip.123pan.cn/1831996731/a_PicBed/project/weilan-devq/20260811172230024.webp)  

 进一步解析

##### a. 帧结构基础定义

```ini
| 0xAA(起始符) | 命令类型(1字节) | 设备ID(1字节) | 数据长度(1字节) | 数据内容(N字节) | 校验和(1字节) | 0x55(结束符) |
```

- **起始符**：`0xAA`（用于帧同步）
- **结束符**：`0x55`
- **设备 ID**：`0x00`(所有设备)、`0x01`-`0x09`(对应 9 台设备)
- **校验和计算**：将起始符之后、校验和之前的所有字节进行 ~~异或运算~~ 累加运算，累加结果对 256 取模（即取低 8 位），确保校验和为 1 字节（0x00-0xFF）。 
- **数据长度**：表示数据内容的字节数，范围 0x00-0xFF

##### b. 命令类型定义

| 命令类型 | 方向 | 说明         |
| -------- | ---- | ------------ |
| 0x10     | 发送 | 登录命令     |
| 0x11     | 响应 | 登录反馈     |
| 0x20     | 发送 | 查询在线设备 |
| 0x21     | 响应 | 查询反馈     |
| 0x30     | 发送 | 连接指定设备 |
| 0x31     | 响应 | 连接反馈     |
| 0x40     | 发送 | 执行动作指令 |
| 0x41     | 响应 | 控制反馈     |
| 0x50     | 发送 | 断开连接     |
| 0x51     | 响应 | 断开反馈     |
| 0xF0     | 响应 | 错误反馈     |

##### c. 各命令帧格式详解

1. **登录命令 (0x10/0x11)**

   **APP 发送帧 (0x10)**：

   - 命令类型：0x10
   - 设备 ID：0x00 (固定)
   - 数据长度：0x00（无数据内容）
   - 数据内容：无

   示例：`0xAA 0x10 0x00 0x00 [校验和] 0x55`

   **设备响应帧 (0x11)**：

   - 命令类型：0x11
   - 设备 ID：0x00 (固定)
   - 数据长度：0x01
   - 数据内容：登录状态 (0x00 = 失败，0x01 = 成功)

   示例（登录成功）：`0xAA 0x11 0x00 0x01 0x01 [校验和] 0x55`

2. **查询在线设备 (0x20/0x21)**

   **APP 发送帧 (0x20)**：

   - 命令类型：0x20
   - 设备 ID：0x00 (固定)
   - 数据长度：0x00
   - 数据内容：无

   示例：`0xAA 0x20 0x00 0x00 [校验和] 0x55`

   **设备响应帧 (0x21)**：

   - 命令类型：0x21
   - 设备 ID：0x00 (固定)
   - 数据长度：N（N 为在线设备数量）
   - 数据内容：在线设备 ID 列表 (每个 ID 占 1 字节，0x01-0x09)

   示例（2 台在线设备）：`0xAA 0x21 0x00 0x02 0x01 0x02 [校验和] 0x55`

   - 数据长度 0x02 表示有 2 台在线设备
   - 0x01 和 0x02 分别表示设备 1 和设备 2 在线

3. **连接指定设备 (0x30/0x31)**

   - **3.1 单个设备连接**

     - **APP 发送帧 (0x30)**：

       - 命令类型：0x30
       - 设备 ID：目标设备 ID (0x01-0x09)
       - 数据长度：0x00
       - 数据内容：无

       示例（连接设备 1）：`0xAA 0x30 0x01 0x00 [校验和] 0x55`

     - **设备响应帧 (0x31)**：

       - 命令类型：0x31
       - 设备 ID：被连接的设备 ID
       - 数据长度：0x01
       - 数据内容：连接状态 (0x00 = 失败，0x01 = 成功)

       示例（设备 1 连接成功）：`0xAA 0x31 0x01 0x01 0x01 [校验和] 0x55`


   - **3.2 多个设备连接**

     - **APP 发送帧 (0x30)**：

       - 命令类型：0x30

       - 设备 ID：0x00（固定，标识批量操作）

       - 数据长度：N（N 为待连接设备数量，1≤N≤9）

       - 数据内容：待连接设备 ID 列表（每个 ID 占 1 字节，0x01-0x09）

       示例（连接设备 1 和设备 3）：`0xAA 0x30 0x00 0x02 0x01 0x03 [校验和] 0x55`

     - **设备响应帧 (0x31)**：

       - 命令类型：0x31
       - 设备 ID：被连接的设备 ID
       - 数据长度：0x01
       - 数据内容：连接状态 (0x00 = 失败，0x01 = 成功)

       示例（设备 1 连接成功）：`0xAA 0x31 0x01 0x01 0x01 [校验和] 0x55`

4. **执行动作指令 (0x40/0x41)**

   **APP 发送帧 (0x40)**：

   - 命令类型：0x40
   - 设备 ID：目标设备 ID (0x01-0x09) 或 0x00 (所有已连接设备)
   - 数据长度：0x02
   - 数据内容：
     - 第 1 字节：动作类型 (0x00 = 基础动作，0x01 = 行为动作，0x02 = 移动控制)
     - 第 2 字节：动作编号

   示例（设备 1 执行基础动作 3）：`0xAA 0x40 0x01 0x02 0x00 0x03 [校验和] 0x55`

   **设备响应帧 (0x41)**：

   - 命令类型：0x41
   - 设备 ID：执行动作的设备 ID
   - 数据长度：0x01
   - 数据内容：执行状态 (0x00 = 失败，0x01 = 成功，0x02 = 执行中)

   示例（设备 1 动作执行成功）：`0xAA 0x41 0x01 0x01 0x01 [校验和] 0x55`

5. **断开连接 (0x50/0x51)**

   **APP 发送帧 (0x50)**：

   - 命令类型：0x50
   - 设备 ID： 0x00 (所有已连接设备)
   - 数据长度：0x00
   - 数据内容：无

   示例（断开所有设备连接）：`0xAA 0x50 0x00 0x00 0x50 0x55`

   **设备响应帧 (0x51)**：

   - 命令类型：0x51
   - 设备 ID：被断开的设备 ID
   - 数据长度：0x01
   - 数据内容：断开状态 (0x00 = 失败，0x01 = 成功)

   示例（所有设备断开成功）：`0xAA 0x51 0x00 0x01 0x01 [校验和] 0x55`



==**未完全实现定义，只是概念，相关程序未修改。**==

```
3.6 编舞指令 (0x60/0x61)
3.6.1 APP 发送帧 (0x60)
用于向设备发送 “全设备统一编舞” 或 “多设备差异化编舞” 指令，通过 “固定字段顺序” 替代分隔符，精简冗余数据。
命令类型：0x60（固定）
设备控制位：1 字节，合并 “设备数量” 与 “全设备动作数”，字段拆分：
高 4 位（bit4~bit7）：设备数量 M
0x0（M=0）：全设备统一编舞
0x1~0x9（M=1~9）：M 台设备差异化编舞
低 4 位（bit0~bit3）：仅 M=0 时有效，表示全设备的动作总数 N（0x1~0xF，支持 1~15 个动作）
数据长度：1 字节，数据内容的总字节数，计算规则：
全设备（M=0）：数据长度 = 3×N（每个动作 3 字节）
差异化（M≥1）：数据长度 = Σ(1 + 3×Nₓ)（每台设备占 “1 字节设备 ID + 3×Nₓ字节动作”，Nₓ为该设备动作数）
数据内容：无分隔符，按固定顺序存储，分两种场景：
全设备编舞（M=0）：[动作1（3字节）] + [动作2（3字节）] + ... + [动作N（3字节）]
单个动作格式：[动作类型（1字节）][映射ID（1字节）][等待时间（1字节）]
动作类型：0x00 = 基础动作、0x01 = 行为动作、0x02 = 移动控制
映射 ID：对应动作表键值（0~17/50~73/99~105）
等待时间：单位 0.1 秒（0x1~0xFF，对应 0.1~25.5 秒）
差异化编舞（M≥1）：[设备ID1（1字节）] + [动作1~N₁（3×N₁字节）] + [设备ID2（1字节）] + [动作1~N₂（3×N₂字节）] + ...
示例 1：全设备执行 2 个动作（准备移动→鞠躬）
设备控制位：高 4 位 = 0x0（M=0），低 4 位 = 0x2（N=2）→ 0x02
数据长度：3×2=6 → 0x06
数据内容：
准备移动（0x00 = 基础、0x03=ID、0x04=0.4 秒）→ 0x00 0x03 0x04
鞠躬（0x00 = 基础、0x06=ID、0x0A=1 秒）→ 0x00 0x06 0x0A
完整帧：0xAA 0x60 0x02 0x06 0x00 0x03 0x04 0x00 0x06 0x0A [校验和] 0x55
示例 2：设备 2（2 个动作）+ 设备 5（1 个动作）差异化编舞
设备控制位：高 4 位 = 0x2（M=2），低 4 位 = 0x0（无效）→ 0x20
数据长度：(1+3×2) + (1+3×1) = 7 + 4 = 11 → 0x0B
数据内容：
设备 2（0x02）+ 准备移动（0x00 0x03 0x04）+ 鞠躬（0x00 0x06 0x0A）→ 0x02 0x00 0x03 0x04 0x00 0x06 0x0A
设备 5（0x05）+ 摇尾巴（0x00 0x07 0x08）→ 0x05 0x00 0x07 0x08
完整帧：0xAA 0x60 0x20 0x0B 0x02 0x00 0x03 0x04 0x00 0x06 0x0A 0x05 0x00 0x07 0x08 [校验和] 0x55
3.6.2 设备响应帧 (0x61)
设备接收 0x60 指令后，反馈编舞解析状态与执行阶段，格式精简，仅包含核心状态信息。
命令类型：0x61（固定）
设备 ID：1 字节，反馈设备的 ID（0x01~0x09，全设备统一反馈时为 0x00）
数据长度：0x01（固定，仅含执行状态）
数据内容：执行状态（1 字节）
0x00 = 解析失败（帧格式错误或参数非法）
0x01 = 解析成功（准备执行）
0x02 = 执行中
0x03 = 执行完成
示例 1：设备 2 解析编舞成功，准备执行
设备 ID：0x02
数据内容：0x01（解析成功）
完整帧：0xAA 0x61 0x02 0x01 0x01 [校验和] 0x55
示例 2：设备 5 编舞执行完成
设备 ID：0x05
数据内容：0x03（执行完成）
完整帧：0xAA 0x61 0x05 0x01 0x03 [校验和] 0x55
```

7. **错误反馈 (0xF0)**

   **设备响应帧 (0xF0)**：

   - 命令类型：0xF0
   - 设备 ID：0xFF (固定，表示错误帧)
   - 数据长度：0x01
   - 数据内容：错误类型 (0xEE = 格式错误)

   示例：`0xAA 0xF0 0xFF 0x01 0xEE [校验和] 0x55`

##### d. 通信流程

1. 登录阶段：APP 发送 0x10 → 设备返回 0x11
2. 查询阶段：APP 发送 0x20 → 设备返回 0x21（数据长度即在线设备数量）
3. 连接阶段：APP 发送 0x30 → 设备返回 0x31
4. 控制阶段：APP 发送 0x40 → 设备返回 0x41
5. 断开阶段：APP 发送 0x50 → 设备返回 0x51

##### e. 异常处理机制

- **超时处理**：发送命令后 5 秒未收到响应，重发命令（最多 3 次）
- **校验和错误**：接收方忽略该帧，不返回响应
- **格式错误**：接收方返回 0xF0 错误帧

#### 3. 文件结构

```bash
HiveBltDg/
├── examples/                  		# 【示例代码目录】
│   ├── bluetooth_server.py    		# 蓝牙服务示例
│   ├── rosbridge_connect.py   		# ROS桥连接示例
│   ├── rosbridge_control.py   		# ROS桥控制示例
│   └── serial_demo.py         		# 串口通信示例
├── resources/                 		# 【资源目录】：存放项目依赖的静态资源
│   └── fonts/                 		# 字体资源 
│       └── SIMYOU.TTF
│   └── images/                 		# 图片资源 
│       └── logo1.png
│       └── logo2.png
├── shell/
│   ├── main_tab_completion.bash	# 命令行自动补全脚本：为python3 main.py提供 Tab 补全，支持补全脚本名与 ser/term/ui 模块参数
│   └── robot-service.service		# 机器人服务配置文件：系统级服务配置，实现串口通信程序开机自启、崩溃自动重启
├── src/                       		# 【核心源代码目录】：存放项目核心业务逻辑
│   ├── serial_comm/           		# 【串口通信模块】
│   │   ├── __init__.py        		# 模块初始化，暴露公共接口
│   │   ├── config.py          		# 串口硬件配置与基础通信功能
│   │   ├── protocol.py        		# 接收到的通信协议处理（帧解析/构建/校验）
|   |   ├── device.py          		# 设备管理与动作执行逻辑 
|   |   └── runner.py          		# 程序入口与主控制逻辑
│   ├── terminal/              		# 【终端模块】
│   │   ├── __init__.py
│   │   ├── config.py          		# 终端配置
│   │   └── runner.py          		# 终端运行逻辑
│   └── ui/                    		# 【UI界面模块】
│       ├── __init__.py
│       ├── config.py          		# UI配置
│       └── runner.py          		# UI运行逻辑
├── utils/                     		# 【工具函数目录】
│   ├── __init__.py
│   ├── action_mapping.py      		# 动作映射工具
│   ├── action_executor.py     		# 动作执行工具
│   └── ip_connect.py          		# IP连接工具
├── main.py                    		# 项目入口
└── README.md                  		# 项目说明
```

  



-----------



































