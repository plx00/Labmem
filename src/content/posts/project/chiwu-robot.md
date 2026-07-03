---
title: 赤乌-点足机器人
published: 2025-03-18
updated: 2026-06-30
description: 赤乌科技-ai智能机器人机械臂机器狗仿生双足具身智能人形机器人python编程
image: /assets/bolg_cover/chiwu-robot.webp
tags: [点足, 机器人, 模型训练]
category: 项目
draft: false
author: larry
password: ""
passwordHint: ""
---

---

# 前言
>这台机器人是 2025 年 3 月购入的，当时只简单测试了模型训练环境的安装与基础使用流程，没有基于它做进一步课题探究。设备已于 2026 年初全部拆除，在此做个存档记录。



- **购买链接**
  
  [ai智能机器人机械臂机器狗仿生双足具身智能人形机器人python编程](https://item.taobao.com/item.htm?id=857906225088&mi_id=0000FO3A5HdSimVZAplrbCBsz9TePhEm31PMdX0x_Ugp6_o&spm=tbpc.boughtlist.suborder_itemtitle.1.68122e8dU9E5p5)
- **相关资料**
  
  [CHIWU赤乌科技-双足机器人.zip(54.6 MB)](https://1831996731.share.123pan.cn/123pan/wdzVjv-85wyv)
- **自启动程序**

  ![1775549469971-e2b2a265-26af-4c45-bbee-c5ab6425124d](https://vip.123pan.cn/1831996731/a_PicBed/project/chiwu-robot/20260630142911384.webp)
- **python-can**
  
  [Python can库_python-can-CSDN博客](https://blog.csdn.net/molangmolang/article/details/140389153)（这部分可以查看CAN卡那个文章）
  
  ```bash
  # CAN模块插上后 命令行 ifconfig -a 查看是否有 can0 或其他
  # 串口 权限设置命令 sudo chmod 777 /dev/ttyUSB0
  '''
  sudo chmod 777 /dev/ttyUSB0
  
  sudo ip link set down can0
  sudo ip link set can0 type can bitrate 1000000 loopback off
  sudo ip link set up can0
  
  sudo ip link set down can1
  sudo ip link set can1 type can bitrate 1000000 loopback off
  sudo ip link set up can1
  '''
  ```
  

# 1. 模型训练

- **参考链接**
  - [legged_gym GitHub地址](https://github.com/leggedrobotics/legged_gym) 
  - [legged gym（包含isaac gym）丝滑安装教程](https://blog.csdn.net/littlewells/article/details/140179837?ops_request_misc=%257B%2522request%255Fid%2522%253A%252266345bca364f7befa431280ae4cb4d48%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=66345bca364f7befa431280ae4cb4d48&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-140179837-null-null.142^v102^pc_search_result_base2&utm_term=legged_gym%E6%95%99%E7%A8%8B&spm=1018.2226.3001.4187) 
- **管理员密码**
  - `1234`

## a. RL训练环境安装

- **PC 电脑配置说明**
  1. 要求带有英伟达独显的 X86PC 电脑，其显卡最好为 RTX2080 以上
- **PC 电脑系统**
  1. 推荐 Ubuntu20.04
- **安装 NVIDIA 显卡驱动，选择较新驱动版本**
  1. 显卡驱动官网下载链接：https://www.nvidia.cn/drivers/lookup/
  2. 最好是在安装系统时，选择安装图形软件，这样就不用去安装驱动这一步骤了，ubuntu20.04 大概对应版本为525
  3. CUDA安装
     ```bash
     wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/cuda-ubuntu2004.pin
     sudo mv cuda-ubuntu2004.pin /etc/apt/preferences.d/cuda-repository-pin-600
     wget https://developer.download.nvidia.com/compute/cuda/11.3.0/local_installers/cuda-repo-ubuntu2004-11-3-local_11.3.0-465.19.01-1_amd64.deb
     sudo dpkg -i cuda-repo-ubuntu2004-11-3-local_11.3.0-465.19.01-1_amd64.deb
     sudo apt-key add /var/cuda-repo-ubuntu2004-11-3-local/7fa2af80.pub
     sudo apt-get update
     sudo apt install cuda-toolkit-11-3
     ```

     ```bash
     # 设置默认 CUDA 版本为 11.3
     # CUDA 默认使用的是 /usr/local/cuda 这个路径的内容。我们只要把它指向 CUDA 11.3 即可：
     
     # 方法一：临时切换（仅当前终端有效）
     export PATH=/usr/local/cuda-11.3/bin:$PATH
     export LD_LIBRARY_PATH=/usr/local/cuda-11.3/lib64:$LD_LIBRARY_PATH
     
     nvcc --version
     # 输出应该包含 release 11.3
     
     # 方法二：永久切换
     # 编辑 ~/.bashrc 文件：
     nano ~/.bashrc
     
     # 在末尾添加
     export PATH=/usr/local/cuda-11.3/bin:$PATH
     export LD_LIBRARY_PATH=/usr/local/cuda-11.3/lib64:$LD_LIBRARY_PATH
     
     # 然后执行
     source ~/.bashrc
     nvcc --version
     ```

- **安装 Miniconda，找到对应自己的 Ubuntu 系统版本、Python 版本的版本**
  1. 官网下载连接： https://repo.anaconda.com/miniconda/，选择自己对应的版本
  2. 安装只需要执行 `.sh` 文件即可，可以直接永久设置虚拟环境和改变安装的位置在安装过程中，Miniconda 会提示您是否初始化。如果跳过，可以手动初始化：
     ```bash
     conda init
     ```
  3. 安装好 miniconda 后
     ```bash
     # 创建一个新的虚拟环境
     conda create -n cw-gym python=3.8
     
     # 进入上一步安装好的 conda 虚拟环境中
     conda activate cw-gym
      
     # 列出所有可用的环境
     conda env list
     
     # 导出当前环境的依赖到一个文件
     conda env export > environment.yml
     
     # 安装特定版本的 Python
     conda create -n myenv python=3.7
     ```
  4. 以下所有关于Python包的安装都在这个虚拟环境下
  5. 如果在Vscode中使用，可能还需要下载一个插件 **Conda Env Activator**
  
- **安装 CUDA、pytorch**
  ```bash
  pip install torch==1.10.0+cu113 torchvision==0.11.1+cu113 torchaudio==0.10.0+cu113 \
  -f https://download.pytorch.org/whl/cu113/torch_stable.html \
  -i https://pypi.tuna.tsinghua.edu.cn/simple \
  --timeout 300
  ```
  这里可以直接将系统pip源更改为清华源或其他国内源
  ```bash
  mkdir -p ~/.pip
  echo "[global]
  index-url = https://pypi.tuna.tsinghua.edu.cn/simple
  " > ~/.pip/pip.conf
  pip install --upgrade pip -i https://pypi.tuna.tsinghua.edu.cn/simple
  ```
- **安装 Isaac Gym**
  1. 官网下载链接：https://developer.nvidia.com/isaac-gym/download
  2. 下载后解压 **IsaacGym_Preview_4_Package.tar.gz** 复制到主目录中
  3. 下载 Isaac Gym Preview 4 仿真平台，解压后进入 python 目录，使用 pip 安装
     ```bash
     # 注意 -e 后面的点
     pip install -e .
     ```
  4. 验证安装：运行 `python/examples` 目录下的例程，验证安装是否成功执行：
     ```bash
     python 1080_balls_of_solitude.py
     ```

     ![1774878983992-70146f62-ab82-4027-b1c7-b715ae10a5c0](https://vip.123pan.cn/1831996731/a_PicBed/project/chiwu-robot/20260630145619146.webp)
- **安装 rsl_rl 库（使用 1.0.2 版本）**
  1. 执行下载命令
     ```bash
     git clone https://github.com/leggedrobotics/rsl_rl
     ```
  2. 执行安装命令
     ```bash
     cd rsl_rl
     git checkout v1.0.2
     pip install -e .
     ```


## b. 模型训练与验证

1. 复制官方给到的 **“chiwu_dz1_gym-main”** 代码包到主目录
2. 修改  **“play.py”** 和 **“train.py”** 代码头部的路径为自己路径

   ![1774878984095-6804173b-f2b1-4b1c-8b22-dd0a3d702df7](https://vip.123pan.cn/1831996731/a_PicBed/project/chiwu-robot/20260630150031106.webp)
3. 修改保存后运行如下命令执行训练模式和 play 模式，进入目录
   ```bash
   cd /chiwu_dz1_gym-main/legged_gym/scripts
   ```
4. 执行训练模式，可以依据需求更改
   ```bash
   python train.py --task=my_dz1 --num_envs 40964096
   ```
   ```bash
   ################################################################################
                          Learning iteration 44/8000                       
   
                          Computation: 2600 steps/s (collection: 1.094s, learning 0.087s)
                  Value function loss: 0.0000
                       Surrogate loss: -0.0159
                Mean action noise std: 1.01
                          Mean reward: 0.00
                  Mean episode length: 30.39
         Mean episode rew_action_rate: -0.0043
          Mean episode rew_ang_vel_xy: -0.3233
         Mean episode rew_base_height: -0.0204
           Mean episode rew_collision: -0.0001
             Mean episode rew_dof_acc: -0.0206
      Mean episode rew_dof_pos_limits: -0.0021
             Mean episode rew_dof_vel: 0.0016
               Mean episode rew_euler: -0.0154
       Mean episode rew_feet_air_time: -0.0059
           Mean episode rew_leeg_roll: -0.0036
           Mean episode rew_lin_vel_z: -0.0030
         Mean episode rew_orientation: -0.0059
    Mean episode rew_tracking_ang_vel: 0.0035
    Mean episode rew_tracking_lin_vel: 0.0032
   --------------------------------------------------------------------------------
                      Total timesteps: 138240
                       Iteration time: 1.18s
                           Total time: 57.63s
                                  ETA: 10188.9s
   
   ################################################################################
                          Learning iteration 45/8000                       
   
                          Computation: 2220 steps/s (collection: 1.181s, learning 0.203s)
                  Value function loss: 0.0000
                       Surrogate loss: -0.0106
                Mean action noise std: 1.01
                          Mean reward: 0.00
                  Mean episode length: 30.94
         Mean episode rew_action_rate: -0.0044
          Mean episode rew_ang_vel_xy: -0.3238
         Mean episode rew_base_height: -0.0203
           Mean episode rew_collision: -0.0001
             Mean episode rew_dof_acc: -0.0219
      Mean episode rew_dof_pos_limits: -0.0023
             Mean episode rew_dof_vel: 0.0016
               Mean episode rew_euler: -0.0150
       Mean episode rew_feet_air_time: -0.0057
           Mean episode rew_leeg_roll: -0.0036
           Mean episode rew_lin_vel_z: -0.0031
         Mean episode rew_orientation: -0.0057
    Mean episode rew_tracking_ang_vel: 0.0036
    Mean episode rew_tracking_lin_vel: 0.0044
   --------------------------------------------------------------------------------
                      Total timesteps: 141312
                       Iteration time: 1.38s
                           Total time: 59.01s
                                  ETA: 10205.4s
   ```

   ![1774878984232-da4ffa94-86b8-4792-b964-5bba5fd36fc0](https://vip.123pan.cn/1831996731/a_PicBed/project/chiwu-robot/20260630150251161.webp)
5. 执行验证模式
   ```bash
   python play.py --task=my_dz1 --num_envs 50
   ```

   ![1774878984350-d708b915-75d3-40b1-b89d-22e7b7fb6f34](https://vip.123pan.cn/1831996731/a_PicBed/project/chiwu-robot/20260630150320513.webp)

## c. 细节补充

一些补充修改，否则程序运行会出现问题

- 修改 Isaac Gym安装包文件内容文件
  - 路径 `$HOME/isaacgym/python/isaacgym/torch_utils.py`
  - 修改其中的第135行 `def get_axis_params(value, axis_idx, x_value=0., dtype=np.float, n_dims=3)`
    ```diff
    - def get_axis_params(value, axis_idx, x_value=0., dtype=np.float, n_dims=3)
    
    + def get_axis_params(value, axis_idx, x_value=0., dtype=np.float64, n_dims=3):
    + 或者
    + def get_axis_params(value, axis_idx, x_value=0., dtype=float, n_dims=3):
    ```
  > 因为代码中使用了 np.float，但是在 NumPy 1.20 及更高版本中，np.float 已经被弃用了，导致了 AttributeError。np.float 是 NumPy 对内置 float 类型的一个别名，NumPy 从版本 1.20 开始将其标记为弃用。根据错误信息，你可以看到 np.float 已经不再是有效的类型，并且建议直接使用 Python 的 float 或 np.float64 来替代。
- pip包版本由于包的版本过高或过低

  ```bash
  # 相应代码会出错，这里列出我在安装时出现错误的包与对应需要调整到的版本
  tensorboard==2.6.0
  
  setuptools < 60.0.0，可以使用版本setuptools < 58.0.0
  #这里的话可能还需要 
  sudo apt-get install python3-distutils  # Ubuntu/Debian
  
  #不知道有没有用处，但是先加上
  protobuf==3.20.1` 或 `3.19.0
  ```
  上面包对应的错误依次是
  ```bash
  ModuleNotFoundError: No module named 'tensorboard'
  
  AttributeError: module 'distutils' has no attribute 'version'
  
  TypeError: Descriptors cannot be created directly.
  If this call came from a _pb2.py file, your generated code is out of date and must be regenerated with protoc >= 3.19.0.
  If you cannot immediately regenerate your protos, some other possible workarounds are:
   1. Downgrade the protobuf package to 3.20.x or lower.
   2. Set PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python (but this will use pure-Python parsing and will be much slower).
  
  More information: https://developers.google.com/protocol-buffers/docs/news/2022-05-06#python-updates
  ```
- 以下是完整的虚拟环境 **cw-gym** 所包含的，哪里不符合可以替换比对一下
  ```bash
  (cw-gym) (base) a@a:~/chiwu_dz1_gym-main$ pip list
  Package                 Version      Editable project location
  ----------------------- ------------ -------------------------
  absl-py                 2.2.2
  cachetools              4.2.4
  certifi                 2025.1.31
  charset-normalizer      3.4.1
  google-auth             1.35.0
  google-auth-oauthlib    0.4.6
  grpcio                  1.70.0
  idna                    3.10
  imageio                 2.35.1
  importlib_metadata      8.5.0
  isaacgym                1.0rc4       /home/a/isaacgym/python
  Markdown                3.7
  MarkupSafe              2.1.5
  ninja                   1.11.1.4
  numpy                   1.24.4
  oauthlib                3.2.2
  pillow                  10.4.0
  pip                     25.0.1
  protobuf                3.19.0
  pyasn1                  0.6.1
  pyasn1_modules          0.4.2
  PyYAML                  6.0.2
  requests                2.32.3
  requests-oauthlib       2.0.0
  rsa                     4.9   Q-
  rsl_rl                  1.0.2        /home/a/rsl_rl
  scipy                   1.10.1
  setuptools              58.0.0
  six                     1.17.0
  tensorboard             2.6.0
  tensorboard-data-server 0.6.1
  tensorboard-plugin-wit  1.8.1
  torch                   1.10.0+cu113
  torchaudio              0.10.0+cu113
  torchvision             0.11.1+cu113
  typing_extensions       4.13.1
  urllib3                 2.2.3
  Werkzeug                3.0.6
  wheel                   0.44.0
  zipp                    3.20.2
  ```
  完整的conda配置文件，可以参老或者直接依照这个配置 `cw_gym.yml` 其中内容如下
  ```yaml
  name: cw-gym
  channels:
    - defaults
  dependencies:
    - _libgcc_mutex=0.1=main
    - _openmp_mutex=5.1=1_gnu
    - ca-certificates=2025.2.25=h06a4308_0
    - ld_impl_linux-64=2.40=h12ee557_0
    - libffi=3.4.4=h6a678d5_1
    - libgcc-ng=11.2.0=h1234567_1
    - libgomp=11.2.0=h1234567_1
    - libstdcxx-ng=11.2.0=h1234567_1
    - ncurses=6.4=h6a678d5_0
    - openssl=3.0.16=h5eee18b_0
    - python=3.8.20=he870216_0
    - readline=8.2=h5eee18b_0
    - sqlite=3.45.3=h5eee18b_0
    - tk=8.6.14=h39e8969_0
    - wheel=0.44.0=py38h06a4308_0
    - xz=5.6.4=h5eee18b_1
    - zlib=1.2.13=h5eee18b_1
    - pip:
        - absl-py==2.2.2
        - cachetools==4.2.4
        - certifi==2025.1.31
        - charset-normalizer==3.4.1
        - google-auth==1.35.0
        - google-auth-oauthlib==0.4.6
        - grpcio==1.70.0
        - idna==3.10
        - imageio==2.35.1
        - importlib-metadata==8.5.0
        - markdown==3.7
        - markupsafe==2.1.5
        - ninja==1.11.1.4
        - numpy==1.24.4
        - oauthlib==3.2.2
        - pillow==10.4.0
        - pip==25.0.1
        - protobuf==3.19.0
        - pyasn1==0.6.1
        - pyasn1-modules==0.4.2
        - pyyaml==6.0.2
        - requests==2.32.3
        - requests-oauthlib==2.0.0
        - rsa==4.9
        - scipy==1.10.1
        - setuptools==58.0.0
        - six==1.17.0
        - tensorboard==2.6.0
        - tensorboard-data-server==0.6.1
        - tensorboard-plugin-wit==1.8.1
        - torch==1.10.0+cu113
        - torchaudio==0.10.0+cu113
        - torchvision==0.11.1+cu113
        - typing-extensions==4.13.2
        - urllib3==2.2.3
        - werkzeug==3.0.6
        - zipp==3.20.2
  prefix: /home/a/.miniconda3/envs/cw-gym
  ```
  - 一些调试软件VsCode、Nomachine、Todesk
## d. 训练曲线

### i. TensorBoard 是什么

TensorBoard 是一个可视化工具，可以展示训练过程中的指标，比如：

- 每轮的 `episode reward`（奖励）
- `loss`（损失）
- `learning rate`
- 等等

它能帮你判断模型有没有在进步、是不是学会了东西。

### ii. 使用 TensorBoard 查看日志  

#### 1. 确认日志路径

训练时会在 logs/ 文件夹下自动保存日志。

```bash
# 例如你跑的是
python train.py --task=my_dz1

# 那么对应的日志路径通常是
logs/my_dz1/Apr15_12-06-55_/  （日期可能不同）
```

#### 2. 运行 TensorBoard

```bash
# 打开终端，进入你的项目目录，然后运行
tensorboard --logdir logs/my_dz1

# 或者更通用一点（如果有多个 task）
tensorboard --logdir logs/

# 它会输出类似
Serving TensorBoard on localhost; to expose to the network, use a proxy
TensorBoard 2.X.X at http://localhost:6006/ (Press CTRL+C to quit)
```
#### 3. 打开网页

1. 打开浏览器
2. 访问地址：http://localhost:6006/
3. 你会看到一个网页界面，里面有各种曲线图

#### 4. 重点关注哪些图

- **`Train/mean_episode_length`**
  - **这是最重要的一条曲线！**
  - 趋势是越来越高 → 策略在变好
  - 趋势波动很大 / 趋势变低 → 策略可能不稳定
- **`loss/actor_loss / loss/critic_loss`**
  - 看损失是否在合理范围（不要 NaN）
  - 训练早期这些 loss 会波动较大是正常的
- **`learning_rate`**
  - 看学习率是否随时间调整（如果你用的是调度器）









































