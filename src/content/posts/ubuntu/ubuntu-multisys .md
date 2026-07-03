---
title: Ubuntu 多系统
published: 2026-04-07
updated: 2026-04-07
description: Ubuntu 多系统搭建
image: /assets/bolg_cover/ubuntu-multisys.webp
tags: [Ubuntu, 多系统, 硬盘]
category: ubuntu
draft: false
author: larry
password: ""
passwordHint: ""
---

---

----

# 项目目录

- **实验的项目**
  - **<span style="color:#80FF00;">Ubuntu 18.04</span>**
    - **<span style="color:#80FF00;">jetson xavier nx 津南镜像烧录 </span>**
    - **<span style="color:#80FF00;">... </span>**
  - **<span style="color:#00CCCC;">Ubuntu 20.04</span>**
    - **<span style="color:#00CCCC;">ROS1</span>**
    - **<span style="color:#00CCCC;">览沃 Mid-360/360s 测试</span>**
    - **<span style="color:#00CCCC;">双足机器人双臂控制</span>**
    - **<span style="color:#00CCCC;">赤乌-点足机器人-强化训练环境搭建（暂时去除,因为这个点足拆了）</span>**
    - **<span style="color:#00CCCC;">...</span>**
  - **<span style="color:#CCCC00;">Ubuntu 22.04</span>**
    - **<span style="color:#CCCC00;">ROS2</span>**
    - **<span style="color:#CCCC00;">Frp</span>**
    - **<span style="color:#CCCC00;">EDULITE_A3 机器臂控制</span>**
    - **<span style="color:#CCCC00;">Claude Code 测试使用</span>**
    - **<span style="color:#CCCC00;">Firefly 个人博客搭建测试</span>**
    - **<span style="color:#CCCC00;">...</span>**



# 1. 前期准备

1. **一个用于制作系统启动盘的 U 盘（读卡器加 cd 卡也可以）**
2. **rufus 软件（直接百度搜索）**
3. **PC 主机**
4. **2T 机械硬盘**

**软件链接：**

rufus 软件 ：https://pan.quark.cn/s/29ba2e6bbc06

DiskGenius 软件 ：https://pan.quark.cn/s/274b121b3814

# 2. 制作系统启动盘

## a. Ubuntu 系统下载

到[Ubuntu](https://releases.ubuntu.com/)官网找到自己想要的版本。

<img src="https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623104409253.webp" alt="1774882317396-73ab35da-2f71-440a-820e-fb42714e9530" style="zoom:150%;" />

如果下载太慢，可以到[清华镜像源网站](https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/)下载

<img src="https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623104505961.webp" alt="1774882317476-2f53f775-b2fb-4f1a-9915-99cf7263d973" style="zoom:120%;" />

依次下载，开始制作U盘启动盘。

- **Ubuntu 18.04**  
- **Ubuntu 20.04**  
- **Ubuntu 22.04**  

## b. 制作U盘启动盘

请启动 Rufus 或 DiskGenius 软件，根据软件界面的指示选择并加载镜像文件。随后，按照指引逐一完成相关设置，最终执行镜像刻录操作。

# 3. 分区方案

2TB 硬盘大概实际可用 **1998GB** 左右，分区大概思路：

1. **EFI 引导分区**
     - 大小：1 GB
     - 作用：三个系统共用引导，必须有
     - 文件系统：FAT32
2. **Ubuntu 18.04**
     - 分区：`/` 根分区
     - 大小：600GB
     - 文件系统：ext4
3. **Ubuntu 20.04**
     - 分区：`/` 根分区
     - 大小：600GB
     - 文件系统：ext4
4. **Ubuntu 22.04**
     - 分区：`/` 根分区
     - 大小：600GB
     - 文件系统：ext4
5. **共享数据盘（共用）**
     - 大小：≈197GB
     - 文件系统：ext4 或 NTFS
     - 三个系统都挂载到 /data
6. **swap 交换分区**
     - 大小：32GB（足够大内存、开虚拟机都稳）

按计算机标准（二进制 1024 进制）：

● 1 GB = **1024 MB**

● 32 GB = **32768 MB**

● 600 GB = **614400 MB**

# 4. Ubuntu 系统安装

## a. 多系统安装关键设置

- 选 `/dev/sda1`（EFI）→ 更改 → 用于：**EFI 系统分区** → 挂载 `/boot/efi`  **⚠️ 千万不要格式化**
- 选对应 600GB 空闲 → 用于：**Ext4 日志文件系统** → 挂载点 `/` → **格式化 ✅**
- 选 `swap` 分区 → 用于：**交换空间** → 不用格式化（已存在）
- 选共享分区 `/dev/sda6` → 用于：**Ext4** → 挂载点 `/data`→ **只在第一次格式化，后面系统只挂载、不格式化**
- **安装启动引导器的设备：选整块硬盘 /dev/sda**

多 Ubuntu 系统的安装顺序依次为：首先安装Ubuntu 22.04，随后是Ubuntu 20.04，最后安装Ubuntu 18.04。

整体安装步骤与常规硬盘安装基本一致，此处不再赘述制作启动盘、BIOS 选择 U 盘启动等通用操作，仅重点说明系统分区相关的关键配置。  

## b. Ubuntu 22.04

1. 简体中文安装
   ![1775029276767-98a2f170-fa79-4bec-9fc6-47501026827e](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623111229950.webp)

2. 设置键盘布局
   ![1775029406503-7dfd0f23-939d-440d-8c5b-3ec251af2626](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623111313093.webp)

3. **正常安装并且勾选 为图形或无线硬件，以及其它媒体格式安装第三方软件**
   ![1775029508278-f5411474-594a-4bae-90e7-c91835bb8413](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623111345362.webp)

4. 选择其他选项
   ![1775029740457-1f93ce02-9264-4ede-8ec2-c0c485ce4bcc](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623111613776.webp)

5. 若硬盘已有系统文件，依次点击对应分区，然后点击左下角减号清除分区。
   ![1775029581627-af7f01e4-7685-4cd2-ab7d-8cf5e2be8ff3](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623111640076.webp)

​	完成清理后的状态（若无系统文件，则原本即为此状态）
​	![1775029636633-ca05a747-93fc-42d1-8b2d-b2cbe8f918a4](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623111651936.webp)

6. EFI 分区（点击 **/dev/sda** 空闲区域，再点击左下角加号）
   ![1775029776128-2b62dae9-4071-47b8-87df-97a73498dcc2](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623111707178.webp)

7. Swap 分区/交换空间/逻辑分区（点击 /dev/sda 空闲区域，再点击左下角加号）
   ![1775029846292-0edc04ab-fbb0-4a72-8a38-0eaecc4ebfe4](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623111720826.webp)

8. 根目录`/`，点击 **/dev/sda** 空闲区域，再点击左下角加号。
   ![1775029877946-249e1ce9-f95e-4c0c-a1e8-7d2cf3ccbe64](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623111736255.webp)

9. 安装启动引导设备，选择设置 EFI 分区的磁盘，这里的话是 **/dev/sda1**，然后**现在安装**。
   ![1775029966969-bb9fe4c5-ebab-4380-91fe-5d7f66e202da](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623111754837.webp)

10. 这里提示
    - 第 1 分区设置为系统分区（EFI 分区）

    - 第 2 分区设置为 Swap（交换空间）

    - 第 3 分区设置为 ext4（Ubuntu 22.04 系统根目录）

    - 然后点击继续。
      ![1775032389320-a80b82e3-5206-4cbc-af96-139007095c38](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623111808344.webp)

11. 配置用户名称及管理员密码为 **"a"** ，随后耐心等待系统安装完成后点击立即重启。

## c. Ubuntu 20.04

参考 **[b. Ubuntu 22.04](#b-ubuntu-2204)**



1. EFI 分区、Swap 分区不用设置，沿用之前的
2. 根目录 `/`（点击 **/dev/sda** 空闲区域，再点击左下角加号）

   ![1775032788134-d418bcfe-8433-4736-b032-a0c0142ebb62](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623112448920.webp)

3. 安装启动引导设备，选择设置 EFI 分区的磁盘，这里的话是 **/dev/sda1**，然后现在安装。

   ![1775032838922-774c98f2-99a4-4833-a7e5-3ee7ca9807ac](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623113102905.webp)

4. 这里提示

  - 第 2 分区设置为 **Swap（交换空间）**

  - 第 4 分区设置为 **ext4**（Ubuntu 20.04 系统根目录）

  - 然后点击继续。

    ![1775032913256-186bdac2-f804-4337-97ad-209b6b9fbda6](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623113114569.webp)

5. 配置用户名称及管理员密码为 **"a"** ，随后耐心等待系统安装完成后点击立即重启。

## d. Ubuntu 18.04

参考 **[b. Ubuntu 22.04](#b-ubuntu-2204)/[c. Ubuntu 20.04](#c-ubuntu-2004)**

### i. 安装系统

1. EFI 分区、Swap 分区不用设置，沿用之前的
2. 根目录 `/`（点击 **/dev/sda** 空闲区域，再点击左下角加号）

   ![1775036818466-a861c957-4fa4-4ff8-be74-7b64bf6c5550](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623113415921.webp)

3. 将剩下的空间设置为共享分区 **/dev/sda6** → 用于：**Ext4 → 挂载点 /data**

   ![1775036859548-3be64411-3d8d-4bfd-a899-e1276660f71d](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623113459474.webp)

4. 安装启动引导设备，选择设置 EFI 分区的磁盘，这里的话是 **/dev/sda1**，然后现在安装 

   ![1775036845095-76091f90-5013-437f-a527-c9ede98b732d](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623113511368.webp)

5. 这里提示

  - 第 2 分区设置为 **Swap**（交换空间）
  - 第 5 分区设置为 **ext4**（Ubuntu 18.04 系统根目录）
  - 第 6 分区设置为 **ext4**（共享空间 /data）
  - 然后点击继续。


![1775036873941-8ef56e96-08cc-4393-b7ea-fd22009591cb](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623113524808.webp)

6. 配置用户名称及管理员密码为 **"a"** ，随后耐心等待系统安装完成后点击立即重启。

### ii. 引导启动出错（若出现的话）

在同一台主机上成功安装Ubuntu 22.04和Ubuntu 20.04后，安装Ubuntu 18.04时，GRUB引导菜单显示正常，但选择"Install Ubuntu"启动项后，屏幕进入花屏状态（显示乱码、条纹或色块），无法正常加载图形安装界面。

#### 1. 原因

Ubuntu 18.04（发布于2018年，默认内核4.15）的显卡驱动与较新硬件平台存在兼容性问题：

|    硬件类型    |                     具体问题                      |
| :------------: | :-----------------------------------------------: |
| **NVIDIA显卡** | RTX 30/40系列、GTX 16系列等新显卡缺少开源驱动支持 |
| **Intel核显**  |     第11代酷睿及以上（Iris Xe架构）驱动不完整     |
|  **AMD显卡**   |    RX 6000/7000系列（RDNA2/RDNA3架构）支持缺失    |
|  **主板UEFI**  |      新平台UEFI固件与旧版内核初始化机制冲突       |

| 现象         | 根因                    | 首选解决               |
| ------------ | ----------------------- | ---------------------- |
| 花屏/黑屏    | 新显卡+旧内核驱动不匹配 | nomodeset 启动参数     |
| 安装后仍花屏 | 未安装专有驱动          | 进系统装NVIDIA/AMD驱动 |
| 全新硬件平台 | 18.04内核太旧           | 升级HWE内核或换20.04+  |

- **为什么 22.04 / 20.04 没事、18.04 花？**
  - **Ubuntu 18.04 发行于 2018 年**，内核 4.15，显卡驱动很旧
  - 你的 CPU / 显卡是**较新硬件**（Intel 10 代后、AMD 5000 系、NVIDIA 16 系 / 30 系）
  - 18.04 自带的 nouveau（NVIDIA 开源）/ Intel i915 驱动**不认识新显卡**，一初始化就花屏
  - 20.04/22.04 内核新、驱动全，直接兼容

#### 2. 立刻解决

**安装时加 `nomodeset`**

1. 从 U 盘启动，出现 **GRUB 安装菜单（Install Ubuntu）*
2. 选中 **Install Ubuntu**，**不要回车**，按 `e` 进入编辑
   <img src="https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623114438420.webp" alt="1775037373156-85264ddc-0ccf-4be9-a937-661ec91ea074" style="zoom:150%;" />

3. 找到以 `linux` 开头的那一行，把：

  ```bash
  quiet splash ---
  ```

  改成：

  ```bash
  # （删掉 ---，加空格 + nomodeset）
  quiet splash nomodeset
  ```
4. 按 **`F10`** 或 **Ctrl+X** 启动安装→ 这时会用**基础 VGA 模式**，不加载独显驱动，**花屏立刻消失**，正常进安装界面。
5. 设置完毕可以完成安装系统步骤。

### iii. 开机仍花屏

#### 1. 临时解决

系统安装重启后，GRUB 菜单选中「Ubuntu」，按 `e` 进入编辑，找到 linux 开头一行，将 `quiet splash $vt_handoff `改为：

```bash
quiet splash $vt_handoff nomodeset
```

按 `F10` 启动，即可正常进入系统。

#### 2. 永久修复

进入系统后，执行以下步骤实现永久修复：

1. 终端运行，打开 GRUB 配置文件：

  ```bash
  sudo gedit /etc/default/grub
  ```
2. 找到并修改以下内容：

   ```bash
   # 原内容
   GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
   ```

   修改后：

   ```bash
   GRUB_CMDLINE_LINUX_DEFAULT="quiet splash nomodeset"
   ```

3. 保存关闭，终端运行更新配置： 

   ```bash
   sudo update-grub
   ```

4. 重启电脑，花屏问题彻底解决。

### iv. NVIDIA 独显优化（更稳定）

未完成（Vs code 也没有安装成功，Vs code 应该是版本太新了）

若主机为 NVIDIA 独显，安装时可彻底禁用开源驱动，避免花屏：GRUB 编辑界面，将 `quiet splash $vt_handoff` 改为：

```bash
quiet splash $vt_handoff nomodeset nouveau.modeset=0
```

按 `F10` 启动安装即可。

系统安装完成后，安装 NVIDIA 官方闭源驱动（适配 NX 使用）：

1. 打开「软件和更新」→「附加驱动」，选择推荐的 NVIDIA 专有驱动，点击「应用更改」，安装完成后重启；
2. 驱动安装成功后，可删除 GRUB 配置中的 `nomodeset`（参考第三步修改 GRUB，改回 `quiet splash` 并更新 GRUB），重启后系统正常加载官方驱动，运行更稳定。

## e. 多系统启动

所有系统安装完成后，开机将出现 GRUB 引导菜单，菜单中会列出已安装的全部系统。按照 22.04 → 20.04 → 18.04 的安装顺序，理论上 Ubuntu 18.04 会作为默认首项显示。

但在实际启动菜单中，Ubuntu 18.04 并未单独列出，原因是**默认第一项的 “Ubuntu” 即为 Ubuntu 18.04**，另外两个系统版本则正常显示在列表中。用户可根据需要在 GRUB 菜单中选择对应系统启动。  
![1775038450220-1fa8b165-f3df-4dde-96bc-1986ecf12a2b](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623120003227.webp)

经过 下面的章节 **[5. boot-repair](#5-boot-repair)** 修复过后，启动引导项有所变化，但基本不变

![1775098985847-06a2a661-6938-462c-be16-139f3661398d](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623120016478.webp)

## f. 参考

这部分的具体过程(图文详细)可以参考以下两个教程：
 - [在移动硬盘上安装Ubuntu20.04教程](https://zhuanlan.zhihu.com/p/424967021)
 - [新手安装 Ubuntu 操作系统步骤教程](https://blog.csdn.net/weixin_42776111/article/details/84961031)

# 5. boot-repair

## a. 正常修复

按照上述过程安装系统后，启动盘在时可以正常进入到 GRUB 引导菜单，一旦拔出就出现

![1775093539907-e7fc69ff-9636-418a-aa58-a4e098785eed](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623120229243.webp)

提示没有启动引导项，解决过程如下：
1. 重新插上启动盘 U盘，进入BIOS选择U盘优先启动，**进入U盘中的Ubuntu系统后**，选择 **Try Ubuntu without installing**（这里是进入的启动盘，不是安装好的那个系统内）
2. 连上网络，安装 boot-repair 软件：

  ```bash
  sudo apt-add-repository ppa:yannubuntu/boot-repair
  
  sudo apt-get update
  
  sudo apt-get install boot-repair
  ```

3. 安装完成后，打开终端执行该软件

  ```bash
  #打开一个终端
  boot-repair
  ```
4. 选择 **“Recommended repair”** ，等待修复完成

## b. 引导盘修复

如果上述方法行不通，提示功能包找不到，可以试试这个官网提供 **自带 boot-repair 的独立启动盘**，不用 Ubuntu Live：

- 下载：https://sourceforge.net/projects/boot-repair-cd/files/boot-repair-disk-64bit.iso
- 用 Rufus /balenaEtcher 做 U 盘
- 从这个 U 盘启动 → 直接就是 boot-repair 界面

这个镜像我应该存过备份，但是为防万一再存一份在百度网盘

[百度网盘-boot-repair-disk-64bit.iso](https://pan.baidu.com/s/1KaF_w-sR9DkZDk9wwKlvfw?pwd=7igt)

**使用方法：**

- 下载这个 ISO 文件（只有几百 MB）
- 用 Rufus / 软碟通 把它写入 U 盘
- 电脑从这个 U 盘启动
- 直接弹出 boot-repair 界面
- 点一下【推荐修复】，它就自动把引导全部修好

# 6. 配置共享分区

 Ubuntu 18.04 / 20.04 / 22.04 多系统共用 ext4 数据盘  

## a. 分区信息确认

已通过 `blkid` 确认共享分区信息：

- 设备：`/dev/sda6`
- UUID：`5d31ece2-e412-47b8-880a-ce57e8713800`
- 文件系统：`ext4`

```bash
/dev/sda6: UUID="5d31ece2-e412-47b8-880a-ce57e8713800" BLOCK_SIZE="4096" TYPE="ext4" PARTUUID="bd0c6faf-e795-46d0-b695-389858a21c44"
```

## b. 创建统一挂载点

在**每个 Ubuntu** 系统中执行：

```bash
sudo mkdir -p /data
```

## c. 配置 /etc/fstab

 关键：配置开机自动挂载,权限全开

1. 打开 fstab 配置文件

  ```bash
  sudo gedit /etc/fstab
  ```
2. 在文件末尾添加以下内容（直接复制，无需修改）：

   ```bash
   # 多系统共享数据盘，自动挂载到 /data
   UUID=5d31ece2-e412-47b8-880a-ce57e8713800  /shared  ext4  defaults  0  2
   ```

3. 保存并关闭编辑器。
## d. 测试配置
  **必须执行，防止开机无法启动**

```bash
  sudo mount -a
```

- 若无任何报错，说明配置正确。

- 若报错，检查 UUID 与格式是否正确。

## e.赋予完整权限（必须执行）

```bash
  sudo chmod -R 777 /data
  sudo chown -R $USER:$USER /data
```

>    这一步是给挂载点目录授权，不是给分区，ext4 分区本身的权限由文件系统管理，这样设置后，你可以正常复制、粘贴、新建、删除。  
>   设置侧边栏显示

## f. 设置侧边栏显示

1. 打开文件管理器

2. 进入 `/data` 目录

3. 右键空白处 → **添加到书签**

4. 分区将固定在左侧边栏，使用方式与 U 盘完全一致

## g. 重启验证

```bash
reboot
```

重启后分区将：

- 自动挂载到 `/data` 
- 在文件管理器侧边栏显示
- 所有用户可正常读写

## h. NTFS 格式补充说明

（如需更换格式时参考）

### i. NTFS 最大单文件大小

- 默认 4KB 簇：最大单文件 **16TB**
- 64KB 簇：最大单文件 **256TB**
- 理论上限：16EB（日常使用无限制）

### ii. NTFS 自动挂载 fstab 写法

```bash
UUID=你的NTFS分区UUID  /data  ntfs-3g  defaults,uid=1000,gid=1000,umask=022  0  0
```

# 7. 网卡驱动

## a. 连接usb无线网卡 

插上网卡后,输入iwconfig , 一般wlan0是树莓派自带的wifi,用于接入外网, wlan1就是另外购买的usb网卡.

```bash
sudo apt install wireless-tools
```

## b. RTL8811CU

<span style="background:#CCE5FF;">Ubuntu22.04 不能使用但是可以直接识别网卡，Ubuntu 18.04/20.04 可以使用并且需要安装网卡驱动。</span>

若使用 RTL8811CU, RTL8821CU 和 RTL8731AU 网卡，需安装对应的网卡驱动，

下载地址：https://gitcode.com/Universal-Tool/c06a0

存在了123网盘中一份，结构目录大概是这样

![1775109766227-5cb69559-00a1-4bbb-b6eb-a1e3935bc205](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu-multisys/20260623122249850.webp)

```bash
# 可能缺少 make 
sudo apt install make -y  
# 可能缺少 gcc\g++，这个是用于编译 RTL8811CU, RTL8821CU 和 RTL8731AU 网卡驱动使用的
sudo apt install gcc build-essential -y
sudo apt install net-tools
```

进入驱动目录，执行以下命令编译安装：

```bash
dog@ubuntu: cd Linux-600M-20.04/
dog@ubuntu: make

CC [M]  /home/Linux-600M-20.04/core/rtw_mp.o
LD [M]  /home/Linux-600M-20.04/8821cu.o
Building modules, stage 2.
MODPOST 1 modules
CC [M]  /home/Linux-600M-20.04/8821cu.mod.o
LD [M]  /home/Linux-600M-20.04/8821cu.ko
make[1]: Leaving directory '/usr/src/linux-headers-5.4.0-1129-raspi'

dog@ubuntu: sudo make install
```

设置系统自动加载驱动，现在重启之后使用 `ifconfig`,是查询不到网卡的

```bash
# 1、临时加载 加载目录中的驱动
sudo insmod /home/dog/Linux-600M-20.04/8821cu.ko

# 2、设置开机自动加载驱动
# 将驱动模块复制到系统默认模块目录（与当前内核匹配）
sudo cp /home/dog/Linux-600M-20.04/8821cu.ko /lib/modules/$(uname -r)/kernel/drivers/net/wireless/
# 更新模块依赖索引
sudo depmod -a
# 添加模块名到自动加载配置文件
echo "8821cu" | sudo tee -a /etc/modules
```

重新启动设备，重启系统后，**验证驱动加载状态**，通过以下命令确认驱动是否自动加载：

```bash
lsmod | grep 8821cu  # 若输出包含 "8821cu"，说明加载成功
iwlist scan          # 扫描附近的 WiFi 网络，验证网卡功能正常
```

禁止内核更新，防止网卡驱动失效（如若已经更新内核，直接重新安装网卡驱动，然后再禁止内核更新）

```bash
# 1. 标记所有内核包为“保留”，禁止更新
sudo apt-mark hold linux-image-* linux-headers-* linux-modules-*
# 2. 确认保留成功（能看到被hold的内核包）
sudo apt-mark showhold | grep linux

# 1. 停止并禁用服务（临时关闭,好像只能用这个）
sudo systemctl stop unattended-upgrades
sudo systemctl disable unattended-upgrades
# 2. 彻底卸载该服务（永久关闭，推荐，但是好像有问题，不好用）
sudo apt remove -y unattended-upgrades
# 3. 验证是否关闭成功（输出“inactive (dead)”或“not found”）
sudo systemctl status unattended-upgrades
```

# 8. Conda 设置

-  安装 conda

  ```bash
  # 下载 x86_64 版本
  wget https://github.com/conda-forge/miniforge/releases/download/26.1.1-3/Miniforge3-26.1.1-3-Linux-x86_64.sh
  
  chmod +x Miniforge3-Linux-x86_64.sh
  ./Miniforge3-Linux-x86_64.sh
  ```

- 创建虚拟环境（ela3 为例）

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

-  Conda 基础命令

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

# 9. ROS 安装

使用鱼香 ROS 安装

```bash
# 鱼香ROS-一键安装
wget http://fishros.com/install -O fishros && . fishros  

# 注意选择对应版本即可
```

# 10. 卸载 多余软件

- LibreOffice（Ubuntu 默认预装）（380MB+）

```bash
sudo apt remove --purge libreoffice*
sudo apt autoremove
sudo apt autoclean
```

- Thunderbird（313MB）

```bash
sudo apt remove --purge thunderbird
sudo apt autoremove
sudo apt autoclean
```

# 11. 脚本

各种简便的小脚本

## a. next_system.sh

本脚本用于在**无显示器**（无法看到 GRUB 启动菜单）的情况下，通过 SSH 远程控制，**安全、可靠**地切换 Ubuntu 多系统的下一次启动项。

它直接修改实际被 UEFI/BIOS 加载的 GRUB 配置文件（Ubuntu 18 所在分区 `/dev/sda5` 中的 `grubenv`），因此无论当前运行的是哪个 Ubuntu 系统，都能生效。

- 一次配置，永久免密（可选）：首次运行时可自动配置 `sudo` 免密规则（仅针对本脚本），后续无需输入密码。
- 自动添加别名（可选）：首次运行时询问是否添加 `setboot` 命令到 `~/.bashrc`，之后可用 `setboot 20` 这样简洁的指令切换。
- 支持三种目标系统：`18`（Ubuntu 18）、`22`（Ubuntu 22）、`20`（Ubuntu 20）。
- 自动挂载/卸载目标分区（`/dev/sda5`），修改 `grubenv` 中的 `next_entry` 变量。
- 验证写入：显示修改后的 `next_entry` 值。
- 可选重启：设置成功后询问是否立即重启。

```bash
#!/bin/bash

# 用法：./set_next_boot.sh {18|22|20}
# 自动配置 NOPASSWD 和 bashrc 别名（首次）

set -e

# 获取脚本的绝对路径
SCRIPT_REALPATH=$(realpath "$0")
SCRIPT_USER="${SUDO_USER:-$USER}"   # 实际调用 sudo 的用户
USER_HOME=$(eval echo "~$SCRIPT_USER")

# 检查是否已经配置了 NOPASSWD 针对此脚本
check_nopasswd() {
    sudo -l -U "$SCRIPT_USER" 2>/dev/null | grep -F "NOPASSWD: $SCRIPT_REALPATH" >/dev/null
}

# 配置 NOPASSWD（需要用户输入一次密码）
configure_nopasswd() {
    echo "检测到当前用户 $SCRIPT_USER 执行此脚本仍需要密码。"
    echo "是否自动配置 NOPASSWD 规则（仅针对此脚本）？(y/n)"
    read -r answer
    if [[ "$answer" =~ ^[Yy]$ ]]; then
        SUDOERS_FILE="/etc/sudoers.d/grub-switch-$(basename "$SCRIPT_REALPATH" .sh)"
        echo "正在添加规则到 $SUDOERS_FILE ..."
        echo "$SCRIPT_USER ALL=(ALL) NOPASSWD: $SCRIPT_REALPATH" | sudo tee "$SUDOERS_FILE" >/dev/null
        sudo chmod 440 "$SUDOERS_FILE"
        echo "配置成功！下次执行此脚本将无需密码。"
        return 0
    else
        echo "跳过配置 NOPASSWD。"
        return 1
    fi
}

# 检查并添加别名到 ~/.bashrc
setup_alias() {
    ALIAS_CMD="alias setboot='sudo $SCRIPT_REALPATH'"
    BASHRC_FILE="$USER_HOME/.bashrc"
    
    # 如果 bashrc 文件不存在则创建
    if [ ! -f "$BASHRC_FILE" ]; then
        touch "$BASHRC_FILE"
    fi
    
    # 检查是否已经存在该别名
    if grep -q "^alias setboot=" "$BASHRC_FILE"; then
        echo "别名 'setboot' 已存在于 $BASHRC_FILE，跳过添加。"
        return 0
    fi
    
    echo "是否添加别名 'setboot' 到 $BASHRC_FILE？(y/n)"
    echo "提示：之后可使用 'setboot 20/22/18' 快速切换系统。"
    read -r answer
    if [[ "$answer" =~ ^[Yy]$ ]]; then
        echo "" >> "$BASHRC_FILE"
        echo "# 快捷切换 Ubuntu 系统 (由 set_next_boot.sh 自动添加)" >> "$BASHRC_FILE"
        echo "$ALIAS_CMD" >> "$BASHRC_FILE"
        echo "别名已添加。请执行 'source ~/.bashrc' 或重新登录后生效。"
    else
        echo "跳过添加别名。"
    fi
}

# 如果不是以 root 身份运行（即没有 sudo），提示需要 sudo
if [ "$EUID" -ne 0 ]; then
    echo "请使用 sudo 运行此脚本（首次执行需要密码，之后可免密）"
    exec sudo "$0" "$@"
fi

# 现在已经是 root 环境，检查 NOPASSWD 配置（针对原始用户）
if ! check_nopasswd; then
    if configure_nopasswd; then
        # 配置成功，退出让用户重新运行（由于已经写入 sudoers，下次免密）
        echo "配置完成。请重新运行脚本以生效（现在即可直接运行，无需 sudo）。"
        exit 0
    fi
fi

# 配置别名（在原始用户的 bashrc 中添加）
setup_alias

# 以下为原有的切换逻辑
show_help() {
    echo "用法: sudo $0 {18|22|20}"
    echo "  18  -> 下次启动进入 Ubuntu 18 (序号 0)"
    echo "  22  -> 下次启动进入 Ubuntu 22 (序号 2)"
    echo "  20  -> 下次启动进入 Ubuntu 20 (序号 4)"
    exit 0
}

case "$1" in
    18)
        NEXT=0
        TARGET_NAME="Ubuntu 18"
        ;;
    22)
        NEXT=2
        TARGET_NAME="Ubuntu 22"
        ;;
    20)
        NEXT=4
        TARGET_NAME="Ubuntu 20"
        ;;
    -h|--help)
        show_help
        ;;
    *)
        echo "错误: 参数必须是 18, 22 或 20"
        show_help
        ;;
esac

U18_ROOT="/dev/sda5"
MOUNT_POINT="/mnt/u18_root"

echo "目标: 下次启动进入 $TARGET_NAME (序号 $NEXT)"
echo "准备挂载 $U18_ROOT 到 $MOUNT_POINT ..."

mkdir -p "$MOUNT_POINT"
if mountpoint -q "$MOUNT_POINT"; then
    echo "$MOUNT_POINT 已挂载，跳过挂载。"
else
    mount "$U18_ROOT" "$MOUNT_POINT"
    echo "挂载成功。"
fi

GRUBENV="$MOUNT_POINT/boot/grub/grubenv"
if [ ! -f "$GRUBENV" ]; then
    echo "错误: 找不到 $GRUBENV"
    umount "$MOUNT_POINT" 2>/dev/null || true
    exit 1
fi

echo "设置 next_entry=$NEXT ..."
grub-editenv "$GRUBENV" set next_entry="$NEXT"

echo "当前设置:"
grub-editenv "$GRUBENV" list | grep next_entry

umount "$MOUNT_POINT"
echo "已卸载 $MOUNT_POINT"

read -p "是否立即重启进入 $TARGET_NAME？(y/n): " confirm
if [[ "$confirm" =~ ^[Yy]$ ]]; then
    echo "系统将在 3 秒后重启..."
    sleep 3
    reboot
else
    echo "设置完成。下次手动重启时会自动进入 $TARGET_NAME"
fi
```









