---
title: 移动固态硬盘烧录Ubuntu20.04
published: 2025-01-05
updated: 2026-06-23
description: 各种 Ubuntu 镜像下载地址
image: /assets/bolg_cover/ubuntu20-use.webp
tags: [Ubuntu, 镜像, 硬盘]
category: ubuntu
draft: false
author: larry
password: ""
passwordHint: ""
---

---

> 这篇文章应该是硬盘买来后一个月记录的，这里的话整理一下，去掉许多基础内容与繁杂的部分，只保留了大致配置，若想查看原文可以在`语雀`中查看`Ubuntu`部分，或者我会写另一个文档将那些总结到那里去。
>
> 

# 前言

在新设备 `Samsung T7 Shile` 上配置 `Ubuntu 20.04`，作为新的开发环境，主要是因为原先的 `Ubuntu 18.04` 不能分屏显示、笔记本音量与亮度不能调节等问题，下面用来记录在新设备上的配置操作。

# 1. Ubuntu 安装

Ubuntu操作系统安装在移动固态硬盘，以实现在不同电脑即插即用。

## a. 前期准备

- 一个用于制作系统启动盘的U盘（读卡器加cd卡也可以）
- rufus软件：直接百度搜索
- DiskGenius软件（用于磁盘分区）
- 待安装系统的移动固态硬盘SSD或者一个U盘（尽量大一点）

**软件链接（百度一下也可以找到）：**

rufus 软件 ：https://pan.quark.cn/s/29ba2e6bbc06

DiskGenius 软件 ：https://pan.quark.cn/s/274b121b3814

## b. 制作系统启动盘

### i. Ubuntu 20 镜像下载

到[Ubuntu](https://releases.ubuntu.com/)官网找到自己想要的版本。

![1774882999964-d7c4111c-8b0f-453d-8120-b035f76c2e36](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623163534108.webp)

如果下载太慢，可以到[清华镜像源网站](https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/)下载

![1774883000058-7ae88490-ac6c-43c0-882b-aad4b7abcc18](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623163542903.webp)

### ii. 制作U盘启动盘

打开 `rufus` 软件，依据提示添加镜像文件，在一一选择进行镜像刻录即可

## c. 磁盘分区（重点）

1. 打开DiskGenius软件，选中自己准备装系统的磁盘（根据型号确定），比如我这里是 `**SamsungPSSD T7**`。
2. 选中磁盘，鼠标右键选择 **`“转换分区表类型为GUID模式”`**（这一步很关键，决定了移动硬盘上的Ubuntu系统插在不同电脑上都能运行）

![1774883000126-f305d139-2e21-4945-909e-225e022c6b69](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623163811615.webp)

3. 磁盘分区，可以分四个区： 
   - ESP(0)分区 ：文件系统类型为FAT32，大小我分配为1.0GB。
     该分区用于Linux系统的 /boot引导分区，后续启动 Ubuntu 系统的引导文件将会放在这个分区下的EFI目录，所以这个分区很重要。
   - 分区(1)：文件系统类型为Linux swap partition，大小我分配为16.0GB。
     该分区用于Linux系统的swap交换空间。
   - 分区(2)：文件系统类型为EXT4，大小我分配为64GB。
     该分区用于Linux系统的 “/” 目录。
   - 分区(3) ：文件系统类型为EXT4大小我分配为320 GB。
     该分区用于Linux系统的 “/home” 目录。
     我这里是将系统安装在1T的移动固态硬盘，除了上述4个分区外，还剩530G左右，剩下的这部分可以当作一个正常的存储硬盘来用。

4. 特别提醒：个人测试的情况是，只有 转换分区表类型为GUID模式，且硬盘的最开始位置是ESP分区(EFI格式) 才能保证移动硬盘上安装的Ubuntu系统插在不同的电脑上都能运行。

5. 上面的是在网址上粘贴的，以实际操作为主，这是我的分区情况

   - 分区表类型：选择 GUID（GPT）
   - ESP 分区设置：必须勾选，分配容量≥100M
   - MSR 分区：不创建、直接取消勾选
   - 系统分区规划（共 4 个分区）
     - 交换分区（swap）：16GB
     - 根目录 /：150GB
     - 用户目录 /home：200GB
     - 剩余空间：格式化为 exFAT

   > 原文：在使用分区工具时，分区表类型选择GUID，ESP分区勾选上（分配100M以上），MSR去掉，在分四个区，交换分区16GB，根目录 /  150GB ，/home目录  分配200GB ，最后归于 exFAT 类型的 硬盘 ，这是我的分区。

## d. 系统安装

1. 在电脑上同时插入U盘启动盘和准备安装系统的移动固态硬盘；
2. 重启电脑进入BIOS（我的电脑型号为联想拯救者 REN-7000K，开机按F2进入BIOS）
3. 进入BIOS后，设置启动优先级为U盘启动优先

4. 接下来的过程比较常规，`安装Ubuntu` -> `选择语言` -> `正常安装` -> `安装类型为“其他选项”` -> <span style="background:#FF9933;">安装启动引导器的设备(一定要选择 /boot 对应的分区ESP0, 不然启动不了) </span>-> `选择地区` -> `用户名、密码设置` -> `等待安装完成`

这部分的具体过程(图文详细)可以参考以下两个教程：

[在移动硬盘上安装Ubuntu20.04教程](https://zhuanlan.zhihu.com/p/424967021)

[新手安装 Ubuntu 操作系统步骤教程](https://blog.csdn.net/weixin_42776111/article/details/84961031)

## e. boot-repair

按照上述过程安装系统后，根据提示拔掉U盘，能够正常进入Ubuntu系统。
但是，当把移动固态硬盘插到其他电脑时，是不能正常使用的，原因是移动硬盘的ESP分区中没有引导文件，解决过程如下：

1. 重新插上U盘和移动固态硬盘，进入BIOS选择U盘优先启动，进入U盘中的Ubuntu系统后，选择 **Try Ubuntu without installing**（这里是进入的启动盘，不是安装好的那个系统内）
2. 连接网络，安装 **boot-repair** 软件：

   ```bash
   sudo apt-add-repository ppa:yannubuntu/boot-repair
   
   sudo apt-get update
   
   sudo apt-get install boot-repair
   ```

3. 安装完成后，打开终端执行该软件

   ```bash
   # 打开一个终端
   boot-repair
   ```
4. 选择 **“Recommended repair”** ，等待修复完成
  
   ```ini
   如何确认修复完成：
   
   如果修复完成，在ESP分区会出现一个名为 EFI 的目录，里面有 BOOT 和 ubuntu 两个子目录，用来启动 Ubuntu 系统的引导文件就是位于 ubuntu 目录中的 shimx64.efi 文件
   
   确认修复完成后，就可以将移动固态硬盘插在不同电脑上运行Ubuntu系统了。
   ```

这部分过程主要参考以下教程：

[移动固态硬盘中安装Ubuntu18.04，并且运行于其他电脑](https://blog.csdn.net/chenxinabcd/article/details/108398371)

[移动硬盘安装Ubuntu系统（UEFI引导）的一些记录](https://blog.csdn.net/u012939909/article/details/80753115)

## f. 关键点汇总

1. 移动固态硬盘需要通过DiskGenius（或类似功能的软件）将磁盘类型转换为GUID格式。
2. 为避免安装系统时出现磁盘分区不对齐、引导分区未在磁盘最开始位置等问题，最好提前将磁盘创建好分区。
3. 安装系统时，选择安装启动引导器的设备，一定要选择所创建的ESP(0)分区, 不然启动不了，因为ESP(0)分区对应系统的/boot引导分区。
4. 为了使移动硬盘上安装的Ubuntu系统在不同电脑上运行，需要执行 boot-repair 过程，创建ESP分区的EFI目录。
5. 参考链接：https://blog.csdn.net/hypc9709/article/details/127941834

## g. 关于系统迁移与备份

暂且不弄（最后也没有弄）

## h. 一些配置

进行所有的软件配置之前，先把火狐与office卸载，因为后面系统使用中有对应的替代品，并且进行系统的更新与配置Ubuntu 中的**软件与更新**。

### i. 卸载 火狐与office

```bash
# 火狐
sudo apt-get remove --purge firefox  

# office
sudo apt-get remove libreoffice-common 

# 卸载多余依赖
sudo apt autoremove
```

### ii. 软件与更新

打开**软件与更新**

![1774883000194-1d7095bb-eb10-4d24-9ff8-7ca1512c9ef4](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623165632971.webp)

将其中的配置变成与下面的图片一致

![1774883004300-1c8239a0-c891-46b3-a97f-a80dd68b29b9](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623165743419.webp)

这里还进行了系统的包更新，将系统安装的 `NVIDIA 525` 驱动版本升级到了`NVIDIA 535`。

![1774883004353-527bca84-9f3a-4cb6-8b5b-389d6a4c76bc](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623165855434.webp)

---

![1774883000278-dec7bf36-406c-4bfc-a660-3fe3cba2b96f](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623165916802.gif)

---

# 2. Ubuntu 美化

![1774883004427-9c37e326-f1ce-49b9-bb00-bf38bad868b2](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623170100109.webp)

需要进行美化一下，方便日常办公使用。

- 参考以下链接：
  -  [https://www.gnome-look.org/browse?cat=108](https://www.gnome-look.org/browse?cat=108)    
  - [史上最良心的 Ubuntu desktop 美化优化指导(1)](https://zhuanlan.zhihu.com/p/63584709)    
  - [Ubuntu 20.04 桌面美化](https://zhuanlan.zhihu.com/p/176977192)    
  - [如何更换 Ubuntu 系统的 GDM 登录界面背景](https://zhuanlan.zhihu.com/p/58834994)    
  - [Ubuntu 桌面美化教程](https://blog.csdn.net/FSKEps/article/details/122269118)    
  - [【Linux】Ubuntu美化主题【教程】](https://blog.csdn.net/qq_44940689/article/details/133094363?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522A4D4C6E4-1D47-4D24-AA24-6CEFF449F59D%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=A4D4C6E4-1D47-4D24-AA24-6CEFF449F59D&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-133094363-null-null.142^v100^pc_search_result_base5&utm_term=ubuntu%E7%BE%8E%E5%8C%96&spm=1018.2226.3001.4187)    
  - [Ubuntu桌面美化教程，手把手教你。含GRUB引导界面美化。](https://blog.csdn.net/2301_76911706/article/details/133000145?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_utm_term~default-0-133000145-blog-133094363.235^v43^pc_blog_bottom_relevance_base2&spm=1001.2101.3001.4242.1&utm_relevant_index=3)
- 所有的美化包都可以从以下这个网站下载。    
  - [https://www.gnome-look.oC](https://www.gnome-look.oC)

## a. Tweak

首先安装美化工具 `Tweak`

```bash
sudo apt-get install gnome-tweak-tool
```

**安装完毕后在菜单中打开`Tweak`**，如果apperenance中Shell部分出现了感叹号，则使用下面的语句安装依赖

```bash
sudo apt-get install gnome-shell-extensions
```

安装之后在扩展中开启**ubuntu dock** 和**ubuntu appindicators**。

## b. 美化任务栏

Ubuntu 20.04 默认的任务栏在桌面左侧，不使用时会自动隐藏。安装 plank dock 工具可以在桌面底部设置一个常驻任务栏。

### i. 安装与配置

****

```bash
# 安装
sudo apt install plank

# 打开配置界面
plank --preferences
```

**打开 plank 的配置界面，如图**

- 外观选项
  - 可以设置任务栏在桌面中的位置，任务栏的样式，任务栏中图标的大小、图标缩放（鼠标移到对应图标上，会有放大效果）等。
- 行为选项
  - 设置任务栏的隐藏模式
- 小部件
  - 提供了一些小工具，如 CPU monitor, applications 等

![image-20260623171951058](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623171951191.webp)

### ii. 设置开机自启动

打开优化工具（gnome-tweaks），将 plank 添加到开机自启动程序栏中。

![image-20260623171651458](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623171651573.webp)

### iii. 固定常用软件

安装 plank 后，任务栏中默认不会固定任何软件。

打开某个软件后，会在底部任务栏中显示，可以通过鼠标右键将其固定在 Dock 上。

![image-20260623172059220](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623172059352.webp)

## c. 更换主题

### i. 下载插件

1. **下载**

任意浏览器在扩展功能搜索插件GNOME Shell，下载并启用，这里推荐火狐浏览器或Chrome浏览器。或者

```bash
sudo apt install chrome-gnome-shell
```

![image-20260623172303429](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623172303523.webp)

2. **添加**

- 打开扩展，或者直接进入https://extensions.gnome.org/ 
- 然后安装Blur my shell、user themes、Hide Dash X这三个组件
  - Blur my shell可以让你的任务栏，Topbar，和窗口变成半透明风格
  - user themes用于更改图标和安装你喜欢的主题

Dash to Dock 用于将Dock隐藏，还需要 `sudo apt remove gnome-shell-extension-ubuntu-dock` 这条命令后重启。

![image-20260623172710758](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623172710863.webp)![image-20260623172730267](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623172730394.webp)

3. **配置**

打开Blur my shell，调整设置和参数，让你需要的地方变为半透明。

![image-20260623172934710](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623172934844.webp)

![aaa](https://1831996731.cdn.123clouddisk.com/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623172959484.webp)

### ii. 布局主题

- 主题包：**WhiteSur Gtk Theme**
  - 网址
    - https://www.gnome-look.org/p/1403328/
  - 主题包 系统存放位置
    - **/usr/share/themes/**
    - **[布局主题 _WhiteSur-gtk-theme-2024.09.02.tar.gz](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623173945279.zip)  (直接执行这里面的install.sh)(最终使用的)**

将下载好的主题包解压到系统存放位置，或者解压后拷贝到系统存放位置。

### iii. Icon 图标

- Icon 图标：**WhiteSur icon theme**
  - 网址
    - https://www.pling.com/p/1405756/
  - Icon 图标 系统存放位置
    - **/usr/share/icons**
    - **[Icon图标_WhiteSur-yellow.zip](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623174236346.zip) ( 最终使用的)**

将下载好的主题包解压到系统存放位置，或者解压后拷贝到系统存放位置。

![image-20260623174207385](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623174207556.webp)

### iv. 鼠标图标

- 鼠标图标
  - **McMojave cursors**  网址
    - https://www.pling.com/p/1355701/
  - **Saturn** 网址
    - https://www.pling.com/p/2194350
  - **Layan cursors** 网址
    - https://www.pling.com/p/1365214
  - 鼠标图标 系统存放位置
    - **/usr/share/icons**
    - **[鼠标图标_02-Layan-cursors.tar.xz](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623174510200.xz)  (最终使用的)**


将下载好的主题包解压到系统存放位置，或者解压后拷贝到系统存放位置。

![image-20260623174454985](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623174455096.webp)

### v. 最终配置

![image-20260623175032194](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623175032381.webp)

##  d. GRUB 主题

> [!TIP]
>
> - **1、下载 GRUB 主题**
>
> 首先，你需要从网上下载一个 GRUB 主题。可以在许多网站上找到主题，比如：https://www.pling.com/browse?cat=109&ord=latest或 GitHub 上的相关项目。
>
> - **2、解压缩主题**
>
> 下载的主题通常会以压缩文件格式（.zip 或 .tar.gz）提供。你需要解压缩它。
>
> 例如，如果你的主题文件名为 grub-theme.zip，可以使用以下命令解压：
>
> `unzip grub-theme.zip`
>
> 如果是 .tar.gz 文件：
>
> `tar -xzvf grub-theme.tar.gz`
>
> - **3、移动主题文件**
>
> 将解压后的主题文件夹移动到 GRUB 主题目录。通常，GRUB 主题位于 /boot/grub/themes/ 目录下。如果没有这个目录，可以创建它。
>
> `sudo mkdir -p /boot/grub/themes sudo mv /path/to/extracted/theme-folder /boot/grub/themes/`
>
> 确保替换 /path/to/extracted/theme-folder 为你的实际路径。
>
> - **4、配置 GRUB 主题**
>
> 接下来，在 GRUB 配置文件中设置新主题。编辑 /etc/default/grub 文件：
>
> `sudo nano /etc/default/grub`
>
> 找到 GRUB_THEME 行，如果没有这个行，可以添加一行。例如：
>
> `GRUB_THEME="/boot/grub/themes/theme-folder/theme.txt"`
>
> 替换 theme-folder 和 theme.txt 为你主题文件夹中的实际名称和文件名。
>
> - **5、更新 GRUB**
>
> 完成设置后，你需要更新 GRUB(很重要)，以便加载新的主题：
>
> `sudo update-grub`
>
> - **6、重启计算机**
>
> 最后重启计算机查看新的 GRUB 主题：
>
> `sudo reboot`
>
> 完成上述步骤后，你应该能够在 GRUB 菜单中看到新的主题。

### i. 配置

上面的是参考网址上面的内容，但是其实只要官方网址下载的时候，下载 **.tar.xz**格式就可以，其中有安装文件 **install.sh**,上面的也没有错误。

- 少量推荐：

  - **[MacOS Monterey inspired grub theme （最终使用的）](https://www.pling.com/p/1577873)**

    -   **GRUB主题_monterey-grub-theme.tar.xz** 
        ![image-20260623175452817](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623175453225.webp)

  - [BigSur GRUB Theme](https://www.pling.com/p/1443844)

    ![image-20260623175547689](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623175547854.webp)

  - [Elegant-wave-grub-themes](https://www.pling.com/p/2206122)

    ![image-20260623175628585](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623175628833.webp)

    ### ii. 成功

    ![image-20260623175724995](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623175725166.webp)

    ---

    ![v2-cb8443f07a41298e45191cef11b90fd2](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623175747640.gif)

    ---

# 3. Ubuntu 软件

安装的一些软件，**依据英文字母排序，标题首字母大写**

## a. 说明

### i. 安装包安装方式

```bash
--------------------------------
# 安装
dpkg -i package_file
dpkg --install package_file

--------------------------------
# 卸载包：
dpkg -r package
dpkg --remove package
# 该命令删除包，但保留配置文件。

dpkg -P package
dpkg --purge package
# 该命令删除包，且删除配置文件。
--------------------------------
```

由于无法修改系统默认的书签页，因此将**视频书签页**作为**软件书签页**使用，所有包含源码的软件文件统一存放在以下目录，以便规范管理。

```ini
/home/k-on/视频
```

![image-20260623225259480](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623225259744.webp)

### ii. 任务栏 快捷方式

解压包解压后并没有创建快捷方式，因此需要手动添加 `.desktop` 文件到`$HOME/.local/share/applications` 目录，并在解压包的执行文件所在目录创建以下脚本。根据格式修改相应的语句，然后执行脚本以生成快捷方式。

```bash
#!/bin/bash

# 获取当前工作目录的路径
current_dir=$(pwd)

# 创建.desktop文件内容
cat > clash.desktop <<EOF
[Desktop Entry]
Name=Clash
Exec=$current_dir/cfw
Icon=$current_dir/clash.png
Terminal=false
StartupNotify=true
Type=Application
Categories=Application;
EOF

# 输出提示信息
echo "Clash桌面快捷方式已创建：$(pwd)/clash.desktop"

# 移动.desktop文件到 $HOME/.local/share/applications/ 目录
sudo mv clash.desktop $HOME/.local/share/applications/

# 输出提示信息
echo "Clash桌面快捷方式已移动到全局目录：$HOME/.local/share/applications/clash.desktop"
```

### iii. Alt+F2 快速启动

大多数软件通过 `dpkg` 安装后，用户可以直接通过命令行启动，无需自定义添加快捷方式。如果是解压包安装，可以根据执行程序的位置创建一个命令脚本来快速启动程序。

**指定文件夹**

由于系统会通过查找指定文件夹来执行程序，因此将执行脚本放置在主目录下的 `~/.local/bin` 目录中，并在 `~/.bashrc` 文件中添加相关配置。（本来想省事，直接全部放到/.config_k-on 文件夹中，但是好像不管用）

```bash
# Alt+F2 快速运行脚本 全局环境设定
export PATH="$HOME/.local/bin:$PATH"
```

添加全局环境后，终端也可以输入命令运行。

> 解压包存储路径：$HOME/视频

> 快捷方式存储路径：$HOME/.local/share/applications

> Alt+F2 快速启动存储路径：$HOME/.local/bin

## b. 软件目录

这里只记录软件的名称、来源，相关设置可以查看`语雀`或者`原先的本地文档`。

| 名称               | 描述                           | 来源                                                         |
| :----------------- | ------------------------------ | ------------------------------------------------------------ |
| **AndroidStudio**  | 安卓App开发工具                | https://developer.android.google.cn/studio?hl=zh-cn <br />https://blog.csdn.net/Spontaneous_0/article/details/141497121（参考配置） |
| **Appimagetool**   | AppImage Linux下的打包工具     | https://appimage.org/ <br />https://github.com/AppImage/appimagetool/releases/tag/continuous（新版） <br />https://github.com/AppImage/AppImageKit（旧版） <br />https://github.com/AppImage/appimagetool?tab=readme-ov-file |
| **Arduino**        | Arduino/Esp32 单片机开发工具   | https://www.arduino.cc/en/software                           |
| **BaiDuNetDisk**   | 百度网盘                       | https://pan.baidu.com/download#linux                         |
| **BalenaEtcher**   | balenaEtcher U盘启动盘烧录器   | https://etcher.balena.io/#download-etcher                    |
| **Blender**        | 3D 建模、显示模型              | https://pan.baidu.com/download#linux                         |
| **Clash**          | VPN 工具                       | 官方网站已经跑路了，有一个新的[**[clash-verge-rev](https://github.com/clash-verge-rev/clash-verge-rev)**]但在Linux上我感觉不好用，有一些卡顿，所以还是用以前的（一些复杂的配置已经弄好了，比如汉化、快捷方式脚本）<br /> [百度网盘_Clash(将三个文件夹内容放在一个中)](https://pan.baidu.com/s/1tEZWP1yjNqJOtnroDOA47A?pwd=sbsh) |
| **CuteCom**        | CuteCom 简单功能的串口调试器   | https://github.com/susundberg/cutecom                        |
| **DeadCells**      | DeadCells 死亡细胞Linux版      | https://www.linuxgame.cn/dead-cells <br />[百度网盘_DeadCells](https://pan.baidu.com/s/1wAqzv22SZdBGzg_xgklF3Q?pwd=tjjh) |
| **Feishu**         | 飞书                           | https://www.feishu.cn/download                               |
| **DrawIO**         | 画流程图用                     | https://github.com/jgraph/drawio-desktop/releases            |
| **Github Desktp**  | Github的桌面版                 | [Github官网](https://github.com/apps/desktop) <br />[Linux版本](https://github.com/shiftkey/desktop/releases) <br />[Github汉化](https://github.com/robotze/GithubDesktopZhTool) |
| **GoogleChrome**   | 谷歌游览器                     | https://www.google.cn/intl/zh-CN/chrome/                     |
| **Instant Design** | 即时设计 矢量图案编辑          | https://js.design/download                                   |
| **KolourPaint**    | 简单功能的画板工具             | https://apps.kde.org/zh-cn/kolourpaint/                      |
| **Java 11**        | JAVA                           | http://www.oracle.com/technetwork/java/javase/downloads/index.html |
| **Krita**          | PS\修图工具                    | https://krita.org/zh-cn/download/                            |
| **Listen1**        | 音乐播放器                     | https://listen1.github.io/listen1/                           |
| **Microsoft Edge** | 微软浏览器                     | https://www.microsoft.com/zh-cn/edge/business/download?form=MA13H4 |
| **NeonAbyss**      | 霓虹深渊                       | https://www.linuxgame.cn/%E9%9C%93%E8%99%B9%E6%B7%B1%E6%B8%8A-neon-abyss |
| **Nomachine**      | 远程控制桌面软件               | https://www.nomachine.com/                                   |
| **QQ**             | qq社交                         | https://im.qq.com/linuxqq/index.shtml                        |
| **Qt Creator**     | Qt开发IDE                      | https://www.qt.io/download-dev <br />http://download.qt.io/archive/qt/5.12/5.12.9/（下载的版本） <br />http://download.qt.io/（备用） |
| **SoGouPinYin**    | 搜狗输入法                     | https://shurufa.sogou.com/?r=mac&t=pinyin                    |
| **Telegram**       | 纸飞机                         | https://desktop.telegram.org/                                |
| **TencentMeeting** | 腾讯会议                       | https://meeting.tencent.com/download?mfrom=OfficialIndex_TopBanner1_Download |
| **Terraria**       | 泰拉瑞亚Linux版                | https://www.linuxgame.cn/terraria                            |
| **Timeshif**       | 系统备份工具                   | `sudo apt-add-repository -y ppa:teejee2008/ppa`<br/>`sudo apt-get update`<br/>`sudo apt-get install timeshift` |
| **ToDesk**         | 远程控制软件（需要控制码）     | https://www.todesk.com/download.html                         |
| **Typora**         | md文档编辑 支持各种文件导出    | https://typora.io/#download  <br />https://typora.io/releases/all （选择 1.8.10 版本安装）<br />[Typora 免费安装教程（已支持最新版 1.9.5）](https://blog.csdn.net/qq_61621323/article/details/141036982?ops_request_misc=%257B%2522request%255Fid%2522%253A%25222e5a7eb5177248a1385a543743c16fda%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fall.%2522%257D&request_id=2e5a7eb5177248a1385a543743c16fda&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~rank_v31_ecpm-5-141036982-null-null.142^v100^pc_search_result_base9&utm_term=typora%E7%A0%B4%E8%A7%A3%E7%89%88%E5%AE%89%E8%A3%85%E6%95%99%E7%A8%8B.&spm=1018.2226.3001.4187) |
| **VLC**            | 视频播放工具                   | https://www.videolan.org/vlc/index.zh_CN.html                |
| **VsCode**         | 代码编辑器                     | http://vscode.p2hp.com/                                      |
| **Wechat**         | 微信                           | https://linux.weixin.qq.com/ （不知道是不是最新的） <br />[鱼香ROS网站上的安装包,使用的是这个](http://github.fishros.org/https://github.com/lovechoudoufu/wechat_for_linux/releases/download/wechat-beta-%E7%BB%95%E8%BF%87%E7%99%BB%E5%BD%95%E6%A3%80%E6%B5%8B/wechat-beta_1.0.0.145_amd64.fixed.deb) |
| **WindTerm**       | 串口调试工具--不止             | https://windterm.net/                                        |
| **Wine-runner**    | wine的可视化 Windows软件运行器 | Gitee（deb）：https://gitee.com/gfdgd-xi/deep-wine-runner <br />Github（deb、pkg、rpm）：[https://github.com/gfdgd-xi/deep-wine-runner](https://gitee.com/link?target=https%3A%2F%2Fgithub.com%2Fgfdgd-xi%2Fdeep-wine-runner) <br />Sourceforge（deb、pkg、rpm）：[https://sourceforge.net/projects/deep-wine-runner/files/](https://gitee.com/link?target=https%3A%2F%2Fsourceforge.net%2Fprojects%2Fdeep-wine-runner%2Ffiles%2F) <br />蓝奏云（deb、rpm）：[https://gfdgdxi.lanzouj.com/b01nz7y3e，密码:7oii](https://gitee.com/link?target=https%3A%2F%2Fgfdgdxi.lanzouj.com%2Fb01nz7y3e%EF%BC%8C%E5%AF%86%E7%A0%81%3A7oii) |
| **WPS**            | WPS 办公软件                   | https://www.wps.cn/product/wpslinux                          |
| **Xmind**          | 思维导图                       | https://xmind.cn/download/                                   |
| **Yesplaymusic**   | 音乐播放软件                   | https://github.com/qier222/YesPlayMusic                      |
|                    |                                |                                                              |

## c. 未安装的

还有几个现在不需要的，但是记录一下

|   名称   |                 链接                  |
| :------: | :-----------------------------------: |
| 空洞骑士 | https://www.linuxgame.cn/hollowknight |
| 崩溃大陆 |  https://www.linuxgame.cn/crashlands  |
| VM虚拟机 |                                       |
|  Docker  |                                       |
| YouTube  |                                       |

# 4. Ubuntu 技巧

这些是 Ubuntu 的一些小技巧

**自己写的脚本文件或者系统配置文件都放在主目录下的 `/.config_k-on` 文件夹，并且将这个文件夹环境加入到 .bashrc 中 **

```bash
# 自定义脚本文件全局环境设定
export PATH="$PATH:$HOME/.config_k-on"
```

## a. 开机自启动

```bash
# 可以在以下命令打开的窗口中配置。
gnome-session-properties
```

## b. ip查询

```bash
# 查询ip地址，子网掩码（两种方式）
ifconfig  
ip addr	

# 查询网关
route -n
# 查询DNS
nslookup hcos
```

## c. 系统监听器

```bash
# 快捷键
Ctrl+Alt+1

# 系统监听器命令
gnome-system-monitor
```

![image-20260623235049189](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623235049367.webp)

## d. Typora 折叠代码

### i. 原理

**可调背景颜色、字体大小、行间距**

```html
<details>
    <summary>点击时的区域标题：点击查看详细内容</summary>
    <textarea readonly rows="15" cols="100" style="background-color: #f0f0f0;font-size: 14px; line-height: 1.7;white-space: pre; overflow: auto; resize: none;">
        &#10;
    </textarea>
</details>
```

**换行符号**

```html
&#10;
```

### ii. 快捷输入

**使用 xclip**

在Ubuntu中，你可以使用`xclip`命令来将固定的语句复制到剪切板。首先，你需要确保安装了`xclip`。如果尚未安装，可以通过以下命令安装：

```bash
sudo apt-get update
sudo apt-get install xclip
```

安装完成后，你可以使用以下命令将特定的语句复制到剪切板：

```bash
echo "你要复制的语句" | xclip -selection clipboard
```

依据这个可以将上述做成命令，**Ctrl + Shift + J** 来触发xclip，在**Ctrl + V** 粘贴到Typora中

在主目录 创建脚本文件 **TyporaFoldingData.sh** 在文件夹 `==.config_k-on==` 中，其中内容

```bash
#!/bin/bash

# HTML 内容
HTML_CONTENT="<details>
    <summary>点击时的区域标题：点击查看详细内容</summary>
    <textarea readonly rows=\"15\" cols=\"100\" style=\"background-color: #f0f0f0; font-size: 14px; line-height: 1.7; white-space: pre; overflow: auto; resize: none;\">
&#10;
       添加内容
    </textarea>
</details>"

# 将 HTML 内容复制到剪贴板
echo "$HTML_CONTENT" | xclip -selection clipboard
```

最后在进行系统设置中快捷键设置 **Ctrl + Shift + J** 启动这个脚本。

![image-20260623235225826](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623235226008.webp)

效果：

<details>
    <summary>点击时的区域标题：点击查看详细内容</summary>
    <textarea readonly rows="15" cols="100" style="background-color: #f0f0f0; font-size: 14px; line-height: 1.7; white-space: pre; overflow: auto; resize: none;">
&#10;
       添加入你想要显示的内容，并且可以设置样式
    </textarea>
</details>

## e. 切换壁纸

Linux下没有个好用的动态壁纸播放软件，我也没找到实现方法，但是做了一个定时切换壁纸的脚本。脚本放在了 ==.config_k-on== 文件夹下，因为需要一个文件夹作为切换壁纸的对象，所以规定了壁纸存在位置在 **/home/k-on/图片/1WallpaperSwitch/image** 文件夹中，并且将这个脚本添加到**开机自启动**中。

```bash
#!/bin/bash

# 图片所在的目录
img_dir="/home/k-on/图片/1WallpaperSwitch/image"

# 检查目录是否存在
if [ ! -d "$img_dir" ]; then
    echo "找不到目录 '$img_dir'。"
    exit 1
fi

# 查找目录中的所有图片文件，并将它们保存到数组中
mapfile -t img_files < <(find "$img_dir" -type f -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif")

# 检查目录中是否有任何图片文件

if [ ${#img_files[@]} -eq 0 ]; then
    echo "在 '$img_dir' 中找不到图片文件。"
    exit 1
fi

while true; do
    # 从数组中随机选择一个图片文件
    img_path=${img_files[$RANDOM % ${#img_files[@]}]}
    
    # 将选定的图片文件设置为桌面背景
    gsettings set org.gnome.desktop.background picture-uri "file:$img_path"
    
    # 每45分钟切换一次
    sleep 2700
done 
```

![image-20260623235535626](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623235535798.webp)

## f. Github 下载

写了一个脚本用来下载自己仓库的项目，因为需要秘钥，所以用脚本代替

```bash
# GitHub个人访问令牌或密码
ghp_
Y11jDngwF9d
TnOApVBgjM8Nq
P7tlp425zz6B
```



```bash
# 脚本名称 gitdl
#!/bin/bash

# 检查是否提供了至少一个参数
if [ $# -lt 1 ]; then
    echo "Usage: $0 <repository-url> [branch-name]"
    exit 1
fi

# 参数
REPO_URL=$1
BRANCH=${2:-default}  # 如果第二个参数没有提供，使用默认分支
USERNAME="plx00" # GitHub用户名
PASSWORD="" # GitHub个人访问令牌或密码

# 如果提供了分支名，则克隆指定分支；否则，克隆默认分支
if [ "$BRANCH" != "default" ]; then
    git clone --single-branch -b "$BRANCH" "https://$USERNAME:$PASSWORD@${REPO_URL#https://}"
else
    git clone --single-branch "https://$USERNAME:$PASSWORD@${REPO_URL#https://}"
fi
```

使用的话直接 **gitdl + .git链接**

## g. 快捷键关机

因为想设置一个快捷键来进行关机，所以设定 **Alt+F4+空格** 来启动一下，以下脚本是打开一个窗口，询问是否关机、重启或取消。

### i. 脚本

```bash
#!/bin/bash

# 检查是否安装了zenity
if ! command -v zenity &>/dev/null; then
  echo "Zenity 未安装，请先安装它，例如运行 'sudo apt install zenity'"
  exit 1
fi

# 使用简单列表形式，支持上下键和回车选择
ACTION=$(zenity --width=350 --height=200 --list --title="🌟 系统操作菜单" \
  --text="<span font='13' foreground='#4A90E2'><b>请选择一个操作：</b></span>" \
  --ok-label="执行" --cancel-label="退出" \
  --column="操作" --column="描述" \
  "关机" "立即关闭计算机" \
  "重启" "重新启动计算机" \
  "锁定" "锁定当前会话")

# 根据用户选择执行操作
case "$ACTION" in
  "关机")
    zenity --question --title="🔴 确认关机" \
      --text="<span font='11' foreground='#E74C3C'>确定要关机吗？未保存的数据可能会丢失。</span>" \
      --ok-label="关机" --cancel-label="取消" \
      --width=300 --height=120
    if [ $? -eq 0 ]; then
      systemctl poweroff
    fi
    ;;
  "重启")
    zenity --question --title="🟠 确认重启" \
      --text="<span font='11' foreground='#F39C12'>确定要重新启动吗？未保存的数据可能会丢失。</span>" \
      --ok-label="重启" --cancel-label="取消" \
      --width=300 --height=120
    if [ $? -eq 0 ]; then
      systemctl reboot
    fi
    ;;
  "锁定")
    if command -v gnome-screensaver-command &>/dev/null; then
      gnome-screensaver-command -l
    elif command -v dm-tool &>/dev/null; then
      dm-tool lock
    elif command -v xdg-screensaver &>/dev/null; then
      xdg-screensaver lock
    elif command -v loginctl &>/dev/null; then
      loginctl lock-session
    else
      zenity --error --title="❌ 错误" \
        --text="<span font='11' foreground='red'>无法锁定屏幕，未找到适合的锁屏工具。</span>" \
        --ok-label="关闭" \
        --width=300 --height=120
    fi
    ;;
  *)
    zenity --info --title="✅ 操作取消" \
      --text="<span font='11' foreground='#2ECC71'>未选择任何操作，已退出菜单。</span>" \
      --ok-label="确认" \
      --width=300 --height=100
    ;;
esac

```

### ii. 设置快捷键

![image-20260623235657593](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623235657800.webp)

# 5. Ubuntu 问题

### a. 时钟混乱

Windwos 与 Linux 的时间可能会不一致

[时间设置：与widows时间一致](https://blog.csdn.net/syluxhch/article/details/128170576)

```bash
timedatectl set-local-rtc 1
```

## b. 副屏刷新显示

副屏在启动后，黑屏或者不刷新

打开 NVIDIA 配置软件，并将其中的 **PRIME Profiles** 中的选项更改为 **NVIDIA （Performance Mode）**。

![image-20260623235815959](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623235816122.webp)

![image-20260623235821996](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260623235822202.webp)

## c. 串口权限（待验证）

### i. 给所有 USB 转串口设备权限

```bash
# 1.创建规则
sudo vim /etc/udev/rules.d/70-ttyusb.rules

# 2.写入
KERNEL=="ttyUSB[0-9]*", MODE="0666"

# 3.重新加载
sudo udevadm control --reload-rules
sudo udevadm trigger

# 4.重新插拔设备
```

### ii. 给指定芯片/开发板权限

```bash
# 1.查看设备信息
lsusb

# 示例：
Bus 003 Device 006: ID 1a86:7523 QinHeng Electronics HL-340 USB-Serial adapter
# 其中
idVendor  = 1a86
idProduct = 7523

# 2.创建规则
sudo vim /etc/udev/rules.d/70-ttyusb.rules

# 3.写入
SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", MODE="0666"

# 4.重新加
sudo udevadm control --reload-rules
sudo udevadm trigger

# 5.重新插拔设备
```
### iii. 查看权限

```bash
# 查看权限
ls -l /dev/ttyUSB*

# 推荐方案（加入串口组）：
sudo usermod -aG dialout $USER
reboot

# 验证
groups
```
## d. 桌面文件

桌面复制不了文件夹，只能通过文件管理其中的桌面来复制粘贴文件，这个很苦恼啊！！

原因就是Ubuntu 20.04它更新了 [GNOME](https://www.gnome.org/getting-gnome/)  **... ...**

未解决，就这样用吧！

## e. 浏览器登录

每次打开浏览器总是弹出窗口提示 **Ubuntu解除"输入密码以解锁密钥环”**  

其实在最初安装~~浏览器~~（不一定是浏览器，忘记是什么了）时，好像就让输入一个什么密码来着，那时候输入管理员密码后，后面两栏不填应该就没这个问题了。

[参考链接](https://blog.csdn.net/acxm45824/article/details/102032599?spm=1001.2101.3001.6661.1&utm_medium=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7EPaidSort-1-102032599-blog-129147913.235%5Ev43%5Epc_blog_bottom_relevance_base9&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7EPaidSort-1-102032599-blog-129147913.235%5Ev43%5Epc_blog_bottom_relevance_base9&utm_relevant_index=1)  第一种方法生效，但注意其中说的登录这一栏来修改，**seahorse**命令会打开另一栏。

> [!NOTE]
>
> **去掉默认密钥环的密码：**
>
> 打开应用程序－>附件－>密码和加密密钥（如果你的没有，在终端中输入 **seahorse**），切换到密码选项卡，会看到一个密码密钥环（我的密钥环是 login），右击－>更改密码，然后在“旧密码”中填入系统登录密码，其他不用填，直接确定，并选择“使用不安全的存储器”，这样就可以去掉默认密钥环的密码了。
>
> ![image-20260624000347559](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260624000347771.webp)

## f. Typora  Ctrl + 5 

Typora 中的 **Ctrl + 5** 快捷键 五级标题突然不管用了，一一排查，是被**Fcitx配置**给占用了，将其注销掉就好了

![image-20260624000410152](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260624000410379.webp)

## g. 文件管理器_书签消失

**$HOME/.config/user-dirs.dirs** 

文件的相关解释

```lua
文件是 user-dirs.dirs，这是一个由 xdg-user-dirs 工具生成的配置文件，用于定义用户目录的路径。这些路径通常用于桌面环境（如 GNOME、KDE 等）来确定用户的文档、音乐、图片等文件夹的位置。
```

这个是管理固定书签页的文件，内容如下

```bash
# This file is written by xdg-user-dirs-update
# If you want to change or add directories, just edit the line you're
# interested in. All local changes will be retained on the next run.
# Format is XDG_xxx_DIR="$HOME/yyy", where yyy is a shell-escaped
# homedir-relative path, or XDG_xxx_DIR="/yyy", where /yyy is an
# absolute path. No other format is supported.
# 
XDG_DESKTOP_DIR="$HOME/桌面"
XDG_DOWNLOAD_DIR="$HOME/下载"
XDG_TEMPLATES_DIR="$HOME/模板"
XDG_PUBLICSHARE_DIR="$HOME/公共的"
XDG_DOCUMENTS_DIR="$HOME/文档"
XDG_MUSIC_DIR="$HOME/音乐"
XDG_PICTURES_DIR="$HOME/图片"
XDG_VIDEOS_DIR="$HOME/视频"
```

书签消失不知道什么原因，但是在最开始打开时**XDG_DESKTOP_DIR="$HOME/桌面"**显示的是**XDG_DESKTOP_DIR="$HOME/"**，没有了桌面，添加上去后，终端输入

`xdg-user-dirs-update`

然后重启电脑就可以了，当然也可以自己定义，只要符合他的要求就可以。

![image-20260624000442494](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260624000442678.webp)

## h. 强制关机导致进不去系统

开机后，进入界面时，一直卡着不动，按下 **ENTER** 回车后

![image-20260624000513875](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260624000514416.webp)

应该是强制关机导致文件系统挂载不正确，使用一个系统盘进入到它的试用系统，打开其中 **Gparted**, 修复其中的 **根目录，/home 目录** 即可，右键点击依次将这两个分区 **check**

![image-20260624000531895](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260624000532155.webp)

在应用所有操作（**Apply All Operations**），完后后关机重新进入系统即可。

![image-20260624000541551](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-use/20260624000541798.webp)

# 6. Ubuntu 依赖

## a. 虚拟串口

首先，安装socat（Socket Cat）。

```bash
sudo apt install socat
```

建立虚拟串口对

```bash
$ socat -d -d pty,raw,echo=0 pty,raw,echo=0

2022/04/22 21:40:09 socat[4835] N PTY is /dev/pts/2
2022/04/22 21:40:09 socat[4835] N PTY is /dev/pts/3
2022/04/22 21:40:09 socat[4835] N starting data transfer loop with FDs [5,5] and [7,7]
```


 这时，socat已经在/dev/pts/2和/dev/pts/3之间建立了关联。

**终端1** 监听其中一个串口

```bash
$ cat < /dev/pts/2
```

**终端2** 另一个串口写入数据

```bash
$ echo "Hello World!" > /dev/pts/3
```

 现在，从终端1可以看到“”Hello World!“”打印信息，证明串口创建并连接成功。测试我们自己的串口程序，一切运行正常。

**也可以通过监听3来获取2的写入数据，并且可以利用python的Serial库进行测试程序**

## b. CH340 串口驱动

官方链接：https://www.wch.cn/download/CH341SER_LINUX_ZIP.html

files目录下：[CH341SER_LINUX.ZIP](files/CH341SER_LINUX.ZIP) 

使用方法查看README文件即可，加一个权限即可使用，文件名自行替换

1. **打开“终端”**
2. **切换到 “driver” 目录**
3. **使用 “make” 编译驱动程序，如果成功，您将看到模块 “ch341.ko”**
4. **键入 “sudo make load” 或 “sudo insmod ch341.ko” 动态加载驱动程序**
5. **键入 “sudo make unload” 或 “sudo rmmod ch341.ko” 以卸载驱动程序**
6. **键入 “sudo make install” 使驱动程序永久工作**
7. **键入“sudo make uninstall”以删除驱动程序**
8. **您可以参考下面的链接获取 uart 应用程序，您可以使用 gcc 或与 cross-gcc 交叉编译**

> [!TIP]
>
> 可能有时系统更新（可能是给卸载了），导致识别串口名称不为**ttyCH341USB**端口，那么再重新执行第八步（删除前驱动）、第三步（编译）与第六步（使驱动程序永久工作）。
>
> 或者make-sudo make load

这样串口识别了，但是没有权限，所以需要添加权限

1. ‌**将用户添加到[dialout组](https://www.baidu.com/s?rsv_dl=re_dqa_generate&sa=re_dqa_generate&wd=dialout组&rsv_pq=fdd74d7f000002f8&oq=CH341USB0没有权限&rsv_t=0238QQPzxvdrJFNnF/Oynt+I4cbFzpukPzTKRlGrDnMjWUOqGbmveRjcukmnLLkPADZRTQk&tn=15007414_15_dg&ie=utf-8)**‌：这是最简单的方法，不需要修改系统设置。只需将当前用户添加到dialout组即可。可以使用以下命令：

   ```bash
   sudo usermod -aG dialout $USER
   ```

   然后重新登录或重启系统，这样用户就有了对[/dev/ttyCH341USB0](https://www.baidu.com/s?rsv_dl=re_dqa_generate&sa=re_dqa_generate&wd=%2Fdev%2FttyCH341USB0&rsv_pq=fdd74d7f000002f8&oq=CH341USB0没有权限&rsv_t=0238QQPzxvdrJFNnF/Oynt+I4cbFzpukPzTKRlGrDnMjWUOqGbmveRjcukmnLLkPADZRTQk&tn=15007414_15_dg&ie=utf-8)的读写权限‌。

2. ‌**修改设备文件的权限**‌：如果上述方法无效，可以尝试修改设备文件的权限。使用以下命令将**/dev/ttyCH341USB0**的权限设置为可读可写可执行：

   ```bash
   sudo chmod 777 /dev/ttyCH341USB0
   ```

   这种方法简单直接，但需要注意，这种方法在系统重启后可能会失效，需要重新设置‌。

3. ‌**使用udev规则**‌：可以通过编写udev规则来永久解决权限问题。首先，确认设备的[USB ID](https://www.baidu.com/s?rsv_dl=re_dqa_generate&sa=re_dqa_generate&wd=USB ID&rsv_pq=fdd74d7f000002f8&oq=CH341USB0没有权限&rsv_t=0238QQPzxvdrJFNnF/Oynt+I4cbFzpukPzTKRlGrDnMjWUOqGbmveRjcukmnLLkPADZRTQk&tn=15007414_15_dg&ie=utf-8)，然后创建一个udev规则文件（例如：/etc/udev/rules.d/50-usbch341.rules），内容如下：

   ```bash
   SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", OWNER="XX", MODE="0666"
   ```

   其中`OWNER="XX"`应替换为你的用户名。保存后，重新插拔设备，udev会自动应用这个规则‌。

## c. git\curl\wget 下载 

```bash
# git
sudo apt-get install git

# curl
sudo apt-get install curl

# wget
# 这个系统自带了
```

## d. gcc\g++

`gcc` 和 `g++`，它们分别对应于 C 和 C++ 的编译器。

```bash
sudo apt-get install build-essential
```

## e. fcitx

输入法 fcitx 🐧输入法，不同于ibus 

```bash
sudo apt install fcitx fcitx-frontend-gtk2 fcitx-frontend-gtk3 fcitx-frontend-qt5 fcitx-module-x11

# 上面的命令可能出现依赖问题，使用以下命令解决依赖问题后在执行以上语句
sudo apt --fix-broken install
```

## f. Vim

```bash
sudo apt-get install vim
```

## g. 硬盘查看

```bash
sudo apt-get install gparted
```



