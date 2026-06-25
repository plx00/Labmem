---
title: Claude/CC/DeepSeek
published: 2026-05-25
updated: 2026-06-24
description: Claude/CC/DeepSeek 进行测试使用
image: /assets/bolg_cover/claude-code.webp
tags: [ClaudeCode, DeepSeek, CC Switch]
category: 技术碎片
draft: false
author: larry
password: ""
passwordHint: ""
---

---



# 前言

>5 月完成 Claude 接入基础测试且全部通过，之后闲置未启用；短视频平台有资讯提及 Claude 官方搭载反蒸馏防护机制，会向第三方中转模型返回虚假干扰数据、造成输出异常（俗称污染第三方模型），本人未验证该情况，若后续复用整套配置，需全流程复测各项功能是否正常可用。



参考以下内容：

[Awesome DeepSeek Agent](https://github.com/deepseek-ai/awesome-deepseek-agent/blob/main/README.zh-CN.md) 

[5分钟安装ClaudeCode并接入DeepSeek_操作文档.pdf](https://1831996731.share.123pan.cn/123pan/wdzVjv-HU2yv) 

<iframe width="100%" height="468" src="//player.bilibili.com/player.html?bvid=BV16YRLB7Exd&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" &autoplay=0> </iframe>

---

# 1. Windows 

## a. Node.js

官网：[Node.js — 在任何地方运行 JavaScript](https://nodejs.org/zh-cn)  

[grid]
![image-20260624232932640](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260624232932866.webp)
![image-20260624232956950](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260624232957035.webp)
[/grid]

1. **安装**：下载完成后，双击安装包，按照安装向导提示完成 Node.js 的安装。
2. **验证**：
   - 按下 `Win + R` 键，输入 `cmd` 并回车，打开命令提示符窗口。
   - 在命令行中输入以下命令，检查 Node.js 版本：
     `node -v`
     如果安装成功，终端会输出 Node.js 的版本号（例如 `v24.16.0`）。
   - 在命令行中输入以下命令，检查 npm 版本：
     `npm -v`

![image-20260624233228498](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260624233228619.webp)

## b. npm

设置国内镜像安装源：
```bash
# 配置
npm config set registry https://registry.npmmirror.com/

# 检验
npm config get registry
npm config list
```

**Windows\Linux 命令一样**

[grid]
![image-20260624234234058](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260624234234152.webp)
![image-20260624234243545](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260624234243636.webp)
[/grid]

这个命令是全局生效的，会影响当前用户所有 npm 操作。

- 如果想恢复官方源，执行：
```bash
npm config set registry https://registry.npmjs.org/
```
- 如果你只想临时使用镜像源（不修改配置），可以这样安装包：
```bash
npm install <包名> --registry=https://registry.npmmirror.com
```

## c. Git

官网：[Git](https://git-scm.com/) 

阿里镜像源：[CNPM Binaries Mirror](https://registry.npmmirror.com/binary.html?path=git-for-windows/) 

Install：[Git - Install for Windows](https://git-scm.com/install/windows) 

![image-20260624234631507](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260624234631624.webp)

1. **安装**：下载完成后，双击安装包，按照安装向导提示完成 Git 的安装。
2. **验证安装**：
   - 按下 `Win + R` 键，输入 `cmd` 并回车，打开命令提示符窗口。
   - 在命令行中输入以下命令，检查 Node.js 版本：
     `git -v`
     如果安装成功，终端会输出 Git 的版本号。
     ![image-20260624234656804](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260624234656920.webp)

## d. CC switch
[GitHub - farion1231/cc-switch](https://github.com/farion1231/cc-switch) 

[Releases · farion1231/cc-switch](https://github.com/farion1231/cc-switch/releases) 

1. 下载对应系统的版本 

![image-20260624235312868](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260624235313028.webp)

2. **安装**：下载完成后，双击安装包，按照安装向导提示完成安装。

![image-20260624235354050](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260624235354181.webp)

## e. Claude Code

![image-20260624235604521](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260624235604622.webp)

```bash
# ClaudeCode安装命令
npm install -g @anthropic-ai/claude-code

# ClaudeCode版本检查
claude --version

# 启动ClaudeCode
claude
```
[grid]
![image-20260624235746034](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260624235746183.webp)
![image-20260624235753710](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260624235753836.webp)
[/grid]

### i. 跳过登录

> [!TIP]
>
> 需要修改`.claude.json`文件内容，否则会出现这个问题，`.claude.json` 配置（上一个字段尾部加英文逗号）：`"hasCompletedOnboarding": true`
>

[grid]
![image-20260625000010658](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625000010765.webp)
![image-20260625000042581](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625000042696.webp)
[/grid]

- 打开文件资源管理器，在地址栏输入本机用户名，进入对应用户目录。
- 点击顶部**查看**工具栏，勾选**显示文件扩展名**、**隐藏文件**，显示全部文件，找到 `.claude.json` 文件。
- 右键 `.claude.json` 文件，选择**用记事本打开**；在文件末尾添加指定内容，**全程使用英文标点**，内容末尾追加英文逗号。

```json
"hasCompletedOnboarding": true
```

![image-20260625000252260](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625000252439.webp)

- 保存文件并关闭记事本，返回 CMD 界面，重新输入 `claud` 启动程序。
- 程序弹出文件夹信任提示，选择**相信**，完成文件夹授权。

[grid]
![image-20260625000325215](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625000325323.webp)
![image-20260625000331965](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625000332074.webp)
[/grid]

# 2. Linux

## a. Node.js

**参考：**[a. Node.js](#a-nodejs)

### i. 直接安装

![image-20260625002138766](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625002138858.webp)

```bash
# 1. 下载（如果官网慢，可以用国内镜像，如 npmmirror）
wget https://nodejs.org/dist/v24.16.0/node-v24.16.0-linux-x64.tar.xz

# 2. 解压
tar -xf node-v24.16.0-linux-x64.tar.xz

# 3. 移动并重命名
sudo mv node-v24.16.0-linux-x64 /usr/local/node

# 4. 添加到 PATH（永久生效）
echo 'export PATH=/usr/local/node/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 5. 验证
node -v   # v24.16.0
npm -v    # 对应版本
```

### ii. nvm

![image-20260625002232513](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625002232631.webp)

```bash
# 下载并安装 nvm：
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# 代替重启 shell
\. "$HOME/.nvm/nvm.sh"

# 下载并安装 Node.js：
nvm install 24

# 验证 Node.js 版本：
node -v 

# 验证 npm 版本：
npm -v  
```

这个可能需要翻墙才可以顺利运行。

## b. npm

**参考：**[b. npm](#b-npm)

## c. Git

### ⅰ. 安装

```bash
sudo apt update
sudo apt install git -y
```

### ⅱ. 验证

安装完成后，在终端中输入以下命令，如果正确显示版本号，则说明安装成功：

```bash
git --version
# 示例输出
git version 2.25.1
```

![image-20260625002505106](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625002505183.webp)

### ⅲ. 从源码编译安装（可选）

如果你需要特定版本或自定义编译选项，可以使用源码编译：

```bash
# 安装编译依赖（Ubuntu 示例）
sudo apt install make libssl-dev libghc-zlib-dev libcurl4-gnutls-dev libexpat1-dev gettext unzip

# 下载源码
wget https://github.com/git/git/archive/v2.40.0.tar.gz
tar -zxf v2.40.0.tar.gz
cd git-2.40.0

# 编译安装
make prefix=/usr/local all
sudo make prefix=/usr/local install

# 验证
git --version
```

## d. CC switch

**参考：**[d. CC switch](#d-cc-switch)

这个 Ubuntu20.04 安装不了，不知道哪个版本可以使用，暂时先弄 Windows 的

**Ubuntu 22.04 完全可以使用**，难道真的旧版本被抛弃了吗 

## e. Claude Code

**参考：**[e. Claude Code](#e-claude-code)

Linux 修改简单多了，就是在主目录下的，修改步骤一样。（Ubuntu22.04 环境）

![image-20260625002803181](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625003011792.webp)





# 3. DeepSeek

![image-20260625003116286](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625003116453.webp)

**充值 -> 创建密钥 -> 复制密钥（必须记住，点击确认之后就不能查看了）**

[grid]
![image-20260625004242674](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625004242808.webp)
![image-20260625004250334](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625004250452.webp)
![image-20260625004259035](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625004259162.webp)
[/grid]






## a. 配置 CC switch

Windows/Linux 一样的配置

- DeepSeekV4Pro模型名称
  - **`deepseek-v4-pro[1m] `**
- 切换/查看模型
  - **`/model`**

1. 点击右上角 `+` 号

   ![image-20260625003648816](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625003648947.webp)

2. 选择 DeepSeek

   ![image-20260625003714843](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625003714984.webp)

3. 下滑，输入 API 密钥

   ![image-20260625003741776](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625003741922.webp)

4. 设置模型映射，点击添加

   ![image-20260625003806685](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625003806829.webp)

5. 打开`claude`，输入命令`/model`查看当前使用模型

   ![image-20260625003845728](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625003845860.webp)

   也可以直接问它`你当前是什么模型`

   ![image-20260625003859161](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625003859300.webp)

## b. 测试

- 新建文件夹，命名为 **claude_demo/**。
- 进入该文件夹，按系统对应方式打开终端： 
  - CC switch：可以在这个对应模型栏后面点击图标直接打开对应文件夹
  - Linux：直接在文件夹内打开终端，或通过 `cd` 命令切换至该目录。
  - Windows：打开文件夹，在地址栏输入 `cmd` 并回车，唤起终端。

- 直接输入`帮我做一个 todo 软件，使用 html+js+css 实现`，过程中的操作就是选择 `Yes`，最后`帮我打开`

  ![image-20260625004136197](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625004136328.webp)



下面是它创建的 `todo软件`（消耗的大概是 1~2 毛）

[grid]
![image-20260625003951232](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625003951448.webp)
![image-20260625004010862](https://vip.123pan.cn/1831996731/a_PicBed/devbits/claude-code/20260625004011002.webp)
[/grid]


[todo.html](https://1831996731.cdn.123clouddisk.com/1831996731/a_PicBed/devbits/claude-code/todo.html)


