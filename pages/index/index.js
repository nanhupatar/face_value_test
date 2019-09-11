//index.js
//获取应用实例
const app = getApp();
import Poster from "../../miniprogram_npm/wxa-plugin-canvas/poster/poster";

Page({
  data: {
    image_url: '/images/custom_bg.jpg',
    result:null,
    posterConfig:null,
    done:false
  },
  onLoad: function () {

  },
  getUserInfo: function (e) {
    console.log(e);
    //授权
    if (e.detail.userInfo) {
      app.userInfo = e.detail.userInfo;
      this.chooseImage();
    } else {
      wx.showModal({
        title: '温馨提示',
        content: '授权之后才可以使用此功能哦',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#3CC51F'
      });
    }
  },
  chooseImage: function () {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log("选择图片", res);
        if (res.tempFiles[0].size <= 1024000) {
          console.log('图片小于1m')
          that.setData({ 
            image_url : res.tempFilePaths[0]
          })
          that.uploadImage(res.tempFilePaths[0]);
        } else {
          wx.showToast({
            title: '请选择小于1m的图片',
            icon: 'none',
          });
        }
      },
      fail: () => {
        console.log("选择图片失败");
        wx.showToast({
          title: '您还没有选择照片',
          icon: 'none',
        });
      },
      complete: () => { }
    });

  },
  uploadImage:function(filePath){
    const that = this;
    wx.showLoading({
      title:'颜值鉴定中',
      mask:true
    })
    wx.uploadFile({
      url: 'https://ai.qq.com/cgi-bin/appdemo_detectface',
      name: 'image_file',
      filePath: filePath,
      success (res) {
        // 解析 JSON
        const result = JSON.parse(res.data)
        if (result.ret === 0) {
          // 成功获取分析结果
          that.setData({ 
            result: result.data.face[0] 
          })
        } else {
          // 检测失败
          wx.showToast({ icon: 'none', title: '找不到你的小脸蛋喽～' })
        }
        wx.hideLoading()
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: '[有人@你]没想到我的颜值居然这么高,你也来试一试吧！',
      path: '/pages/index/index',
      imageUrl: this.data.imageUrl
    }
  },
  checkAuth:function(){
    const that = this;
    wx.getSetting({
      success (res) {
        console.log(res.authSetting)
        console.log(res.authSetting["scope.writePhotosAlbum"])
        if(res.authSetting["scope.writePhotosAlbum"]===undefined){
          wx.authorize({
            scope:'scope.writePhotosAlbum',
            success:()=>{
              that.onCreatePoster();
            },
            fail:()=>{
              wx.showToast({
                title:'保存失败,请检查相册权限',
                icon:'none'
              })
            }
          })
        }else if(res.authSetting["scope.writePhotosAlbum"]===true){
          that.onCreatePoster(); 
        }else{
          wx.openSetting();
        }
      }
    })
  },
  onPosterSuccess:function(e){
    console.log(e)
    // wx.previewImage({
    //   urls: [e.detail],
    // })
    wx.saveImageToPhotosAlbum({
      filePath: e.detail,
      success: (result) => {
        wx.showToast({
          title:'已保存至相册'
        })
      }
    });
      
  },
  onPosterFail:function(e){
    console.log(e)
  },
  onCreatePoster:function() {
    const that = this;
    wx.showLoading({title:'生成中...'});
    wx.getImageInfo({
      src: that.data.image_url,
      success: (res) => {
        const { width, height } = res;
        const ch = 710 * height / width;
        const containerHeight = ch + 300;
        const posterConfig = {
          width: 750,
          height: containerHeight,
          backgroundColor: '#fff',
          debug: false,
          blocks:[{
            x:20,
            y:ch-140,
            width:200,
            height:155,
            backgroundColor:"rgba(0,0,0,0.06)",
            borderRadius:20,
            zIndex:2
          }],
          texts: [
            {
              x: 40,
              y: ch-120,
              baseLine: 'top',
              text: '性别',
              fontSize: 28,
              color: '#ffffff',
              zIndex:3
            },
            {
              x: 120,
              y: ch-120,
              baseLine: 'top',
              text: that.data.result.gender>50?'男':'女',
              fontSize: 28,
              color: '#ffffff',
              zIndex:2
            },
            {
              x: 40,
              y: ch-75,
              baseLine: 'top',
              text: '年龄',
              fontSize: 28,
              color: '#ffffff',
              zIndex:2
            },
            {
              x: 120,
              y: ch-75,
              baseLine: 'top',
              text: that.data.result.age+'',
              fontSize: 28,
              color: '#ffffff',
              zIndex:2
            },
            {
              x: 40,
              y: ch-30,
              baseLine: 'top',
              text: '颜值',
              fontSize: 28,
              color: '#ffffff',
              zIndex:2
            },
            {
              x: 120,
              y: ch-35,
              baseLine: 'top',
              text: that.data.result.beauty+'',
              fontSize: 44,
              color: '#d4237a',
              zIndex:2
            },
            {
              x: 340,
              y: ch+100,
              baseLine: 'top',
              text: '长按识别小程序码',
              fontSize: 38,
              color: '#080808',
            },
            {
              x: 340,
              y: ch+150,
              baseLine: 'top',
              text: '查看你的颜值鉴定报告',
              fontSize: 28,
              color: '#929292',
            },
          ],
          images: [
            {
              width: 710,
              height: ch,
              x: 20,
              y: 20,
              url: that.data.image_url,
              borderRadius:10,
              zIndex:1
            },
            {
              width: 200,
              height: 200,
              x: 92,
              y: ch+50,
              url: '/images/qrcode.png',
            }
          ]
        }
        that.setData({
          done:false
        },()=>{
          that.setData({ posterConfig,done:true }, () => {
            Poster.create();
            wx.hideLoading();
          });
        })

      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title:'生成失败',
          icon:"none"
        })
      },
    });
  },
})
