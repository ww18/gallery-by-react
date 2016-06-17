require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

//获取图片数据
var imageDatas = require('../data/imageDatas.json');

/*
* 获取区间的一个随机数
* */
function getRangeRandom(low, high){
  return Math.ceil(Math.random() * (high - low) + low);
}
/*
* 获取0-30之间的一个任意正负值
* */
function get30DegRandom(){
  return (Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30);
}

//获取图片url信息
imageDatas = (function(imageDatasArr){

  //imageDatasArr.forEach(function(item){
  //  item.imageURL = require('../images/' + item.fileName);
  //});

  for(let i=0, j=imageDatasArr.length; i<j; i++){
    let singleImg = imageDatasArr[i];
    singleImg.imageURL = require('../images/' + singleImg.fileName);
    imageDatasArr[i] = singleImg;

  }
  return imageDatasArr;

})(imageDatas);

//图片组件
class ImgFigure extends React.Component{
  /*
  * imgFigure 的点击处理函数
  * 注意handleClick的调用用bind改变调用的对象
  * */
  handleClick(e){
    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();
    }

    e.stopPropagation();
    e.preventDefault();
  }

  render(){

    var styleObj = {};

    //如果props属性中指定了这张图片的位置，则使用
    if(this.props.arrange.pos){
      styleObj.left = this.props.arrange.pos.left;
      styleObj.top = this.props.arrange.pos.top;
    }

    //如果图片的旋转角度有值并且不为0，添加旋转角度
    if(this.props.arrange.rotate){
      (['Moz','ms','Webkit','']).forEach(function(value){
        styleObj[value + 'Transform'] = 'rotate(' + this.props.arrange.rotate + 'deg';
      }.bind(this));

    }

    if(this.props.arrange.isCenter){
      styleObj['zIndex'] = 11;
    }

    var imgFigureClassName = 'img-figure';
    imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse':'';

    return (
      <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick.bind(this)}>
        <img src={this.props.data.imageURL} alt={this.props.title}/>
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
          <div className='img-back' onClick={this.handleClick.bind(this)}>
            <p>
              {this.props.data.desc}
            </p>
          </div>
        </figcaption>
      </figure>
    )
  }
}

//控制组件
class ControllerUnit extends React.Component{
  handleClick(e){
    //如果点击的是当前正在选中态的按钮，则翻转图片，否则将对应的图片居中
    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();
    }
    e.preventDefault();
    e.stopPropagation();
  }
  //nnd 居然少写了个</span>让我找半天问题
  render(){
    var controllerUnitClassName = 'controller-unit';

    // 如果对应的是剧中的图片，显示控制按钮的居中状态
    if(this.props.arrange.isCenter){
      controllerUnitClassName += ' is-center';

      //如果同时对应的是翻转图片，显示控制按钮的翻转状态
      if(this.props.arrange.isInverse){
        controllerUnitClassName += ' is-inverse';
      }
    }

    return (
      <span className={controllerUnitClassName} onClick={this.handleClick.bind(this)}></span>
    )
  }
}

class AppComponent extends React.Component {
  constructor(props){

    super(props);
    this.Constant = props.Constant;
    this.state = {imgsArrangeArr: props.imgsArrangeArr};
  }


  //组件加载以后为每张图片计算位置
  componentDidMount(){

    //首先拿到舞台的大小
    var stageDOM = ReactDOM.findDOMNode(this.refs.imgStage),
        stageW = stageDOM.scrollWidth,
        stageH = stageDOM.scrollHeight,
        halfStageW = Math.ceil(stageW / 2),
        halfStageH = Math.ceil(stageH / 2);
    //拿到一个image的大小
    var imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
        imgW = imgFigureDOM.scrollWidth,
        imgH = imgFigureDOM.scrollHeight,
        halfImgW = Math.ceil(imgW / 2),
        halfImgH = Math.ceil(imgH / 2);

    //计算中心图片的位置点
    this.Constant.centerPos = {
      left: halfStageW - halfImgW,
      top: halfStageH - halfImgH
    }
    //计算左侧，右侧区域图片位置的取值范围
    this.Constant.hPosRange.leftSecX[0] = -halfImgW;
    this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
    this.Constant.hPosRange.rightSecX[0] = halfStageW - halfImgW;
    this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
    this.Constant.hPosRange.y[0] = -halfImgH;
    this.Constant.hPosRange.y[1] = stageH - halfImgH;

    //计算上侧图片位置的取值范围
    this.Constant.vPosRange.topY[0] = -halfImgH;
    this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
    this.Constant.vPosRange.x[0] = halfStageW - imgW;
    this.Constant.vPosRange.x[1] = halfStageW;

    this.rearrange(0);

  }

  /*
  * 翻转图片
  * @param index 输入当前被执行inverse操作的图片对应的图片信息数组的index值
  * @return ｛function｝这是一个闭包函数， return一个真正待被执行的函数
  * */

  inverse(index){
    return function(){
      var imgsArrangeArr = this.state.imgsArrangeArr;

      imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;

      this.setState({
        imgsArrangeArr: imgsArrangeArr
      })

    }.bind(this);
  }

  /*
  * 利用rearrange函数，居中对应index的图片
  * @param 需要居中的index
  * */

  center(index){
    return function(){
      this.rearrange(index);
    }.bind(this);
  }

  /*
  * 重新布局所有图片，
  * @param centerIndex
  * */
  rearrange(centerIndex){
    var imgsArrangeArr = this.state.imgsArrangeArr,
        Constant = this.Constant,
        centerPos = Constant.centerPos,
        hPosRange = Constant.hPosRange,
        vPosRange = Constant.vPosRange,
        hPosRangeLeftSecX = hPosRange.leftSecX,
        hPosRangeRightSecX = hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,
        vPosRangeTopY = vPosRange.topY,
        vPosRangeX = vPosRange.x,

        imgsArrangeTopArr = [],
        topImgNum = Math.floor(Math.random() * 2),//取一个或者不取
        topImgSpliceIndex = 0,

        imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);

    //首先居中centerIndex的图片, 不需要旋转
    imgsArrangeCenterArr[0] = {
      pos: centerPos,
      rotate: 0,
      isCenter: true
    };

    //取出要布局上侧的图片的状态信息
    topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));
    imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);

    //布局位于上侧的图片
    imgsArrangeTopArr.forEach(function(value, index){
      imgsArrangeTopArr[index] = {
        pos:{
          top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
          left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
        },
        rotate: get30DegRandom(),
        isCenter: false
      }
    });

    //布局两侧的图片
    for(let i = 0, j = imgsArrangeArr.length, k = j/2; i < j; i++){
      var hPosRangeLORX = null;

      //前半部分布局左边，右边部分布局右边
      if(i < k){
        hPosRangeLORX = hPosRangeLeftSecX;
      }else{
        hPosRangeLORX = hPosRangeRightSecX;
      }
      imgsArrangeArr[i] = {
        pos: {
          top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
          left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
        },
        rotate: get30DegRandom(),
        isCenter: false
      }
    }

    if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
      imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
    }

    imgsArrangeArr.splice(centerIndex, 0 , imgsArrangeCenterArr[0]);

    this.setState({
      imgsArrangeArr: imgsArrangeArr
    })

  }

  render() {
    var controllerUnits = [],
        imgFigures = [];

    //imageDatas.forEach(function(value){
    //  imgFigures.push(<ImgFigure data={value} />)
    //});
    for(let i = 0, j = imageDatas.length; i < j; i++){

      if(!this.state.imgsArrangeArr[i]){
        this.state.imgsArrangeArr[i] = {
          pos:{
            left: 0,
            top: 0
          },
          rotate: 0,
          isInverse: false,
          isCenter: false
        }
      }

      imgFigures.push(<ImgFigure key={i} arrange={this.state.imgsArrangeArr[i]} ref={'imgFigure'+ i} data={imageDatas[i]} inverse={this.inverse(i)} center={this.center(i)} />);
      controllerUnits.push(<ControllerUnit key={i} arrange={this.state.imgsArrangeArr[i]} inverse={this.inverse(i)} center={this.center(i)} />);
    }

    return (
      <section className="stage" ref="imgStage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
}

AppComponent.defaultProps = {
  Constant: {
    centerPos:{
      left: 0,
      right: 0
    },
    hPosRange:{//水平方向的取值范围
      leftSecX:[0, 0],
      rightSecX:[0, 0],
      y: [0, 0]
    },
    vPosRange:{//垂直方向的取值范围
      x: [0,0],
      topY: [0,0]
    }
  },
  imgsArrangeArr: []
};

export default AppComponent;
