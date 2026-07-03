---
title: EL-A3 机械臂
published: 2026-05-16
updated: 2026-05-16
description: EDULITE_A3 机械臂相关开发
image: /assets/bolg_cover/el-a3.webp
tags: [机器臂, ROS, CAN]
category: 项目
draft: false
author: larry
password: ""
passwordHint: ""
---

---

# 前言

> 本文档未实施实际试验与验证环节，内容仅对前期各项准备工作、相关参考资料进行归纳记录。

> [!TIP]
>
> 下面的资料应该是另一款机械臂的，暂时先记录到这里
>
> - **机械臂链接:** https://pan.baidu.com/s/1JBb9TsJffEzl4ww_3iDlLg?pwd=30dy 提取码: 30dy 
> - **仿生机械手掌链接:** https://pan.baidu.com/s/1rfOsuwvLHOHs4k2pzcvDQA?pwd=6647 提取码: 6647

# 1. 相关设置

## a. 安装Ubuntu 22

安装方式

- [x] 硬盘系统安装

- [ ] 虚拟机安装

虚拟机太卡了，使用硬盘安装 Ubuntu 22.04 吧！

## b. 卸载 多余软件

```bash
# LibreOffice（Ubuntu 默认预装）（380MB+）
sudo apt remove --purge libreoffice*
sudo apt autoremove
sudo apt autoclean

# Thunderbird（313MB）
sudo apt remove --purge thunderbird
sudo apt autoremove
sudo apt autoclean
```

## c. Conda 设置

1. **安装 conda**

   ```bash
   # 下载 x86_64 版本
   wget https://github.com/conda-forge/miniforge/releases/download/26.1.1-3/Miniforge3-26.1.1-3-Linux-x86_64.sh
   
   chmod +x Miniforge3-Linux-x86_64.sh
   ./Miniforge3-Linux-x86_64.sh
   ```

2) **创建虚拟环境**

   ```bash
   # 安装后重新打开终端，或执行 source ~/.bashrc 使 conda 命令生效
   
   # 1-1. 临时启用 conda
   eval "$(~/miniforge3/bin/conda shell.bash hook)"
   
   # 1-2. 永久配置，先临时启用 conda：
   eval "$(~/miniforge3/bin/conda shell.bash hook)"
   # 然后运行一次这个命令：
   conda init
   
   # 2. 创建一个新的python环境
   # 创建一个名为 ela3 的 python3.10环境
   conda create -n ela3 python=3.10
   # 进入环境
   conda activate ela3
   
   # 3. 设置别名
   echo "alias ela3='eval \"\$(~/miniforge3/bin/conda shell.bash hook)\" && conda activate ela3'" >> ~/.bashrc
   echo "alias ela3-e='while [ -n \"\$CONDA_DEFAULT_ENV\" ]; do conda deactivate; done && cd ~'" >> ~/.bashrc
   source ~/.bashrc
   
   # 或者直接在 .bashrc 文件中添加
   alias ela3='eval "$(~/miniforge3/bin/conda shell.bash hook)" && conda activate ela3'
   alias ela3-e='while [ -n "$CONDA_DEFAULT_ENV" ]; do conda deactivate; done && cd ~'
   
   
   
   # 之后启动环境与退出环境
   ela3    # 启动虚拟环境
   ela3-e  # 退出虚拟环境
   ```

3) **Conda 基础命令**

   ```bash
   # 精简记忆
   ela3            # 进入环境
   conda deactivate   # 退出
   conda install xxx  # 安装
   conda list         # 查看已安装
   conda env list     # 看所有环境
   ```

   ```bash
   # 所有命令前提（未Conda init的）
   eval "$(~/miniforge3/bin/conda shell.bash hook)"
   
   # 一、进入 / 退出环境
   # 进入 ela3 环境
   conda activate ela3
   # 退出环境
   conda deactivate
   
   # 二、查看环境信息
   # 查看当前有哪些虚拟环境
   conda env list
   # 查看当前环境安装了哪些包
   conda list
   # 搜索某个包能不能装
   conda search pyqt
   
   # 三、安装 / 卸载包
   # conda 安装包
   conda install 包名 -y
   # 例如
   conda install pyqt -y
   conda install numpy -y
   
   # pip 安装包（conda 没有时用）
   pip install 包名
   # 例如
   pip install go2-webrtc-connect
   
   # 四、管理虚拟环境
   # 创建新环境（示例：python3.11）
   conda create -n 环境名 python=3.11 -y
   # 删除不需要的环境
   conda remove -n 环境名 --all -y
   ```

## d. ROS 安装

安装 ROS 2 Humble Hawksbill（谦逊的玳瑁）
```bash
# 鱼香 ROS 一键安装
wget http://fishros.com/install -O fishros && . fishros
```

注意选择对应版本即可

# 2. EDULITE_A3

- **源码地址**：[RobStride/EDULITE_A3](https://gitee.com/robstride/EDULITE_A3#el-a3-%E6%9C%BA%E6%A2%B0%E8%87%82-ros2-%E6%8E%A7%E5%88%B6%E7%B3%BB%E7%BB%9F)（其中有完整的项目说明）

- **项目克隆**：

  ```bash
  git clone https://gitee.com/robstride/EDULITE_A3.git
  ```

- **123网盘**：[EDULITE_A3-main.zip(49.3 MB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-Tuz6v)

- **相关文章**：

  - [灵足时代开年“王炸”：千元级EduLite A3开源机械臂正式发布](https://zhuanlan.zhihu.com/p/2004927099262227446)
  - [千元级开源机械臂发布，来自北京亦庄](https://www.ncsti.gov.cn/kjdt/scyq/bjjjjskfq/jkdt/202602/t20260228_239312.html)
  - [RobStride灵足时代-哔哩哔哩](https://space.bilibili.com/1401919338/dynamic)







-----