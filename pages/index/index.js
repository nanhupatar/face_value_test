//index.js
//获取应用实例
const app = getApp();

Page({
  data: {
    image_url: '/images/custom_bg.jpg',
    cwith: 0,
    cheight: 0,
    result:null
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
  }
})
