import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    base: '/cxf-blog/',
    title: "cxf-blog",
    description: "蔡晓锋的博客",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            {text: '首页', link: '/'},
            {text: '前端', link: '/nvm-install'},
            {text: '后端', link: '/backend'},
            {text: '运维', link: '/centos-install-docker'}
        ],

        sidebar: [
            {
                text: '前端',
                items: [
                    {text: 'nvm安装', link: '/nvm-install'},
                ]
            },
            {
                text: '后端',
                items: [
                    {text: '后端', link: '/backend'}
                ]
            },
            {
                text: '运维',
                items: [
                    {text: 'CentOs安装Docker', link: '/centos-install-docker'},
                    {text: 'CentOs网络', link: '/docker-network'},
                    {text: 'idea连接docker', link: '/idea-connects-docker'},
                ]
            }
        ],

        socialLinks: [
            {icon: 'github', link: 'https://github.com/vuejs/vitepress'}
        ]
    }
})
