import request from '@/utils/request'

// 查询角色列表
export function listPerformance(query) {
  return request({
    url: '/system/performance/list',
    method: 'get',
    params: query
  })
}

// 查询角色详细
export function getPerformance(pId) {
  return request({
    url: '/system/performance/' + pId,
    method: 'get'
  })
}

// 新增角色
export function addPerformance(data) {
  return request({
    url: '/system/performance',
    method: 'post',
    data: data
  })
}

// 修改角色
export function updatePerformance(data) {
  return request({
    url: '/system/performance',
    method: 'put',
    data: data
  })
}

// 角色状态修改
export function changePerformanceStatus(pId, auditStatus) {
  const data = {
    pId,
    auditStatus
  }
  return request({
    url: '/system/performance/changeStatus',
    method: 'put',
    data: data
  })
}

// 删除角色
export function delPerformance(pId) {
  return request({
    url: '/system/performance/' + pId,
    method: 'delete'
  })
}

