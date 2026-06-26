import {
	LinkPreset,
	type NavBarConfig,
	type NavBarLink,
	type NavBarSearchConfig,
	NavBarSearchMethod,
} from "../types/config";
import { siteConfig } from "./siteConfig";

// 根据页面开关动态生成导航栏配置
const getDynamicNavBarConfig = (): NavBarConfig => {
	// 基础导航栏链接
	const links: (NavBarLink | LinkPreset)[] = [
		// 主页
		LinkPreset.Home,
	];

	// 文章及其子菜单
	links.push({
		name: "文章",
		url: "/post/",
		icon: "material-symbols:article-rounded",
		children: [
			// 归档
			LinkPreset.Archive,
			// 分类
			LinkPreset.Categories,
			// 标签
			// LinkPreset.Tags,
		],
	});

	// // ❌ 注释原来这里独立添加友链和留言板的两个 if 块
	// // 根据配置决定是否添加友链，在siteConfig关闭pages.friends时导航栏不显示友链
	// if (siteConfig.pages.friends) {
	// 	links.push(LinkPreset.Friends);
	// }
	// // 根据配置决定是否添加留言板，在siteConfig关闭pages.guestbook时导航栏不显示留言板
	// if (siteConfig.pages.guestbook) {
	// 	links.push(LinkPreset.Guestbook);
	// }

	// 我的及其子菜单
	links.push({
		name: "我的",
		url: "/my/",
		icon: "material-symbols:person",
		children: [
			// ✅ 友链和留言板（受开关控制）
			...(siteConfig.pages.friends ? [LinkPreset.Friends] : []),
			...(siteConfig.pages.guestbook ? [LinkPreset.Guestbook] : []),
			// 原有项
			...(siteConfig.pages.gallery ? [LinkPreset.Gallery] : []),
			...(siteConfig.pages.bangumi ? [LinkPreset.Bangumi] : []),
		],
	});

	// 自定义导航栏链接,并且支持多级菜单
	links.push({
		name: "链接",
		url: "/links/",
		icon: "material-symbols:link",

		// 子菜单
		children: [
			{
				name: "GitHub",
				url: "https://github.com/plx00?tab=repositories",
				external: true,
				icon: "fa7-brands:github",
			},
			{
				name: "QQ",
				url: "https://qm.qq.com/q/LXtOP7qfy6",
				external: true,
				icon: "fa7-brands:qq",
			},
		],
	});

	// 关于及其子菜单
	links.push({
		name: "关于",
		url: "/content/",
		icon: "material-symbols:info",
		children: [
			// 根据配置决定是否添加赞助，在siteConfig关闭pages.sponsor时导航栏不显示赞助
			...(siteConfig.pages.sponsor ? [LinkPreset.Sponsor] : []),

			// 关于页面
			LinkPreset.About,
		],
	});


	// 仅返回链接，其它导航搜索相关配置在模块顶层常量中独立导出
	return { links } as NavBarConfig;
};

// 导航搜索配置
export const navBarSearchConfig: NavBarSearchConfig = {
	method: NavBarSearchMethod.PageFind,
};

export const navBarConfig: NavBarConfig = getDynamicNavBarConfig();
