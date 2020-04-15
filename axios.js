import axios from 'axios';

axios.defaults.timeout = 5000;
let pending = []; //声明一个数组用于存储每个ajax请求的取消函数和ajax标识
let cancelToken = axios.CancelToken;
let removePending = (ever) => {
  if (pending.length<2) return
  if (pending.length === 1) return
  for(let p = 0; p < pending.length; p++){
      if(pending[p].u === ever.url + '&' + ever.method) { //当当前请求在数组中存在时执行函数体
          pending[p].f(); //执行取消操作
          pending.splice(p, 1); //把这条记录从数组中移除
      }
  }
}
//http request 拦截器
axios.interceptors.request.use(
  config => {
    // ------------------------------------------------------------------------------------
    let str = JSON.stringify(config.params);
    removePending(config); //在一个ajax发送前执行一下取消操作
    config.cancelToken = new cancelToken((c)=>{
       // 这里的ajax标识我是用请求地址&请求方式拼接的字符串，当然你可以选择其他的一些方式
       pending.push({ u: config.url + '&' + config.method + config.params, f: c });  
    });
    // -----------------------------------------------------------------------------------------
    return config;
  },
  error => {
    return Promise.reject(err);
  }
);
//http response 拦截器
axios.interceptors.response.use(
  response => {
    // ------------------------------------------------------------------------------------------
    removePending(response.config);  //在一个ajax响应后再执行一下取消操作，把已经完成的请求从pending中移除
    return response;
  },
  error => {
    return Promise.reject(error)
  }
)

export default axios;