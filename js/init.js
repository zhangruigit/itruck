$('.container').css('display', 'none');
$('.edit').css('display', 'none');
$('.deviceManage').css('display', 'none');
$('.itemMenu_car').css('display', 'none');
$('.systemManage').css('display', 'none');
var username = '';
var realm = 'botron.com';
var nonce = Math.random().toString(36).substr(2);
var domain = 'http://ibook.qik56.com:8999';
//var domain = 'http://192.168.1.88:8098';
var currentType = ''; //当前选中类型
var currentEditId = ''; //当前选中id
var condition = {
	car: [{
		descr: '车牌',
		code: 'number'
	}, {
		descr: '车型',
		code: 'model'
	}, {
		descr: '归属地',
		code: 'dependency'
	}, {
		descr: '使用类型',
		code: 'purpose'
	}, {
		descr: '所有人',
		code: 'owner'
	}, {
		descr: '终端厂商',
		code: 'device_factory'
	}],
	device: [{
		descr: '编号',
		code: 'number'
	}, {
		descr: '设备类型',
		code: 'device_type'
	}, {
		descr: '品牌',
		code: 'brand'
	}, {
		descr: '车牌',
		code: 'plate_number'
	}, {
		descr: '厂商',
		code: 'factory'
	}]
}
var level1 = [];
var el = null;
var op_urls = []; //操作类型 0 query 1 update
//登录
function login() {
	username = $('.user').val();
	var password = md5($('.pwd').val());
	var ai = {
		username: username,
		password: password,
		realm: realm
	}
	var response = md5(ai.username + "&" + ai.password + "&" + ai.realm + "&" + nonce + "&login");
	$.ajax({
		url: domain + '/itruck/login',
		type: 'get',
		data: {
			username: username,
			nonce: nonce,
			response: response,
			realm: realm
		},
		success: function(res) {
			if(res.statuscode == 200) {
				$('.loginWrap').css('display', 'none');
				$('.container').css('display', 'block');
				$('html').css('background', '#f7f7f7');
				$('body').css('background', '#f7f7f7');
				$('.login_name').text(res.name);
				$.ajax({
					url: domain + '/ostrich/queryPrivileges',
					type: 'get',
					data: {
						offset: 0,
						rows: 200,
						username: username,
						nonce: nonce,
						result: '123',
						rows: 60,
						offset: 0,
						role_id: res.role_id
					},
					success: function(_res) {
						if(_res.statuscode == 200) {
							loadMenu(_res.items); //装在左侧菜单
							loadChildMenu(_res.items); //装在左侧子菜单
							console.log(_res.items);
							$.ajax({
								url: domain + '/ostrich/queryConstant',
								type: 'get',
								data: {
									offset: 0,
									rows: 200,
									username: username,
									nonce: nonce,
									result: '123'
								},
								success: function(response) {
									loadType(response);
								}
							});
						}
					}
				});
			}
		},
		error: function(err) {
			console.log(err);
		}
	})
}
//权限控制，装在左侧菜单
function loadMenu(data) {
	var str = '';
	for(var i = 0; i < data.length; i++) {
		if(data[i].level == 1) {
			level1.push(data[i].name);
			str += '<div class="itemMenu" onclick="menu(this)" id="' + data[i].name + '">';
			if(data[i].name == 'itruck_device_mg') {
				str += '<img class="item" src="img/icon_setting.png" />';
			} else if(data[i].name == 'itruck_truck_mg') {
				str += '<img class="item" src="img/icon_car.png" />';
			}
			str += '<div class="item itemMenuName">' + data[i].descr + '</div>';
			str += '<img class="item" src="img/icon_bottom.png" />';
			str += '</div><div class="' + data[i].name + '" style="display:none"></div>';
		}
	}
	$('#loadMenuWrap').html('');
	$('#loadMenuWrap').append(str);

}
//装在子菜单
function loadChildMenu(data) {
	var str1 = '';
	for(var n = 0; n < level1.length; n++) {
		str1 = ''
		for(var j = 0; j < data.length; j++) {
			var url_insert = '';
			var url_update = '';
			var url_delete = '';
			var url_query = '';
			for(var m = 0; m < data.length; m++) {
				if(data[m].level == 3 && data[m].parent == data[j].name) {
					if(data[m].name == 'query') {
						url_query = data[m].url;
					} else if(data[m].name == 'insert') {
						url_insert = data[m].url;
					}
				}
			}
			if(data[j].level == 2 && data[j].parent == level1[n]) {
				str1 += '<div class="itemMenu_car">';
				str1 += '<div class="itemMenu" onclick="itemMenu_child(this)" url_query="' + url_query + '" url_insert="' + url_insert + '" name="' + data[j].name + '">';
				if(data[j].name == "itruck_device_info") {
					str1 += '<img class="item item_child" src="img/icon_file.png" />';
				} else if(data[j].name == "itruck_device_monitor") {
					str1 += '<img class="item item_child" src="img/icon_eye.png" />';
				} else if(data[j].name == "itruck_truck_info") {
					str1 += '<img class="item item_child" src="img/icon_info.png" />';
				} else if(data[j].name == "itruck_truck_monitor") {
					str1 += '<img class="item item_child" src="img/icon_pc.png" />';
				}

				str1 += '<div class="item itemMenuName">' + data[j].descr + '</div>';
				str1 += '</div>';
			}

		}
		$('.' + level1[n]).html('');
		$('.' + level1[n]).append(str1);
	}

}
//点击左侧菜单
function menu(obj) {
	if(el == null) {
		el = obj;
		$(obj).addClass('menu_active');
	} else if(el != obj) {
		$(el).removeClass('menu_active');
		$(obj).addClass('menu_active');
		el = obj
	}
	var name = $(obj).attr('id');
	$('.' + name).toggle();
}
//点击子菜单
function itemMenu_child(obj) {
	//控制菜单样式
	if(el == null) {
		el = obj;
		$(obj).addClass('menu_active');
	} else if(el != obj) {
		$(el).removeClass('menu_active');
		$(obj).addClass('menu_active');
		el = obj
	}
	//保存当前菜单操作的URL
	op_urls[0] = $(obj).attr('url_query');
	op_urls[1] = $(obj).attr('url_insert');
	//save current type
	currentType = $(obj).attr('name');
	//query 
	queryInfo();
}

//装在类型
function loadType(res) {
	var str = '<option value="0">请选择</option>';
	for(var i = 0; i < res.truck_state.length; i++) {
		str += '<option value="' + res.truck_state[i].code + '">' + res.truck_state[i].descr + '</option>'
	}
	$('.truck_state').append(str);

	var str1 = '<option value="0">请选择</option>';
	for(var i = 0; i < res.device_state.length; i++) {
		str1 += '<option value="' + res.device_state[i].code + '">' + res.device_state[i].descr + '</option>'
	}
	$('.device_state').append(str1);
}

//新增
function add() {
	switch(currentType) {
		case 'itruck_truck_info':
			$(".carManage").css('display', 'block');
			$(".deviceManage").css('display', 'none');
			break;
		case 'itruck_device_info':
			$(".deviceManage").css('display', 'block');
			$(".carManage").css('display', 'none');
			break;
		default:
			break;
	}
	$('.result').css('display', 'none');
	$(".edit").css('display', 'block');
	resetParams();
}

//编辑
function editManage(id) {
	currentEditId = id;
	var data = {
		username: username,
		nonce: nonce,
		result: '123',
		rows: 60,
		offset: 0,
		id: id
	};
	$.ajax({
		url: domain + op_urls[0],
		type: 'get',
		data: data,
		success: function(res) {
			if(res.statuscode == 200) {
				switch(currentType) {
					case 'itruck_truck_info':
						$(".carManage").css('display', 'block');
						$(".deviceManage").css('display', 'none');
						$("#carManageForm").setFormValue(res.items[0]);
						break;
					case 'itruck_device_info':
						$(".deviceManage").css('display', 'block');
						$(".carManage").css('display', 'none');
						$("#deviceManageForm").setFormValue(res.items[0]);
						break;
					default:
						break;
				}
				$('.result').css('display', 'none');
				$(".edit").css('display', 'block');
			}
		},
		error: function(err) {
			alert(err)
		}
	});
}
//搜索
function searchByKey() {
	var key = $(".search_condition").val();
	var keyWord = $('.keyWord').val();
	var data = {
		username: username,
		nonce: nonce,
		realm: realm,
		offset: 0,
		rows: 200
	};
	data[key] = keyWord;
	$.ajax({
		url: domain + op_urls[0],
		type: 'get',
		data: data,
		success: function(res) {
			if(res.statuscode == 200) {
				Table(res.items, currentType);
			}
		},
		error: function(err) {
			console.log(err);
		}
	})
}
//查询
function queryInfo() {
	loadSearchCondition(); //装在下拉筛选条件
	$.ajax({
		url: domain + op_urls[0],
		type: 'get',
		data: {
			username: username,
			nonce: nonce,
			realm: realm,
			offset: 0,
			rows: 200
		},
		success: function(res) {
			if(res.statuscode == 200) {
				Table(res.items, currentType);
			}
		},
		error: function(err) {
			console.log(err);
		}
	})
}

//删除
function delManage(id) {
	sweetAlert({
		title: "你确定要删除？",
		text: "",
		type: "warning",
		showCancelButton: true,
		confirmButtonColor: "#DD6B55",
		cancelButtonText: '取消',
		confirmButtonText: "删除",
		closeOnConfirm: false
	}, function() {
		$.ajax({
			url: domain + op_urls[1],
			type: 'post',
			data: {
				username: username,
				nonce: nonce,
				realm: realm,
				id: id,
				result: '123',
				is_deleted: 1
			},
			success: function(res) {
				if(res.statuscode == 0) {
					swal("删除成功", "", "success");
					queryInfo();
				}
			},
			error: function(err) {
				swal(err, "", "success");
			}
		})

	});

}

//保存
function save(type) {
	var data = $("#" + type + "ManageForm").serializeJson('result:"213123";username:' + username + ';nonce:' + nonce + ';id:' + currentEditId);
	$.ajax({
		url: domain + op_urls[1],
		type: 'post',
		data: data,
		success: function(res) {
			if(res.statuscode == 0) {
				swal("保存成功", "", "success")
				$('.result').css('display', 'block');
				$('.edit').css('display', 'none');
				queryInfo();
			}
		}
	});
}
//取消
function cancel(type) {
	$('.result').css('display', 'block');
	$('.edit').css('display', 'none');
}

//load  table
function Table(data, type) {
	switch(type) {
		case 'itruck_truck_info':
			carTable(data);
			break;
		case 'itruck_device_info':
			deviceTable(data);
			break;
			//		case 'system':
			//			systemTable(data);
			//			break;
		default:
			break;
	}
}
//load car table
function carTable(data) {
	var str = '<tr><th>车牌号码</th>' +
		'<th>排放标准</th>' +
		'<th>使用类型</th>' +
		'<th>归属地</th>' +
		'<th>车辆类型</th>' +
		'<th>车辆状态</th>' +
		'<th>车型</th>' +
		'<th>发动机型号</th>' +
		'<th>排量</th>' +
		'<th>所有人</th>' +
		'<th>联系电话</th>' +
		'<th>注册里程数</th>' +
		'<th>注册时间</th>' +
		'<th>动力类型</th>' +
		'<th>配件编号</th>' +
		'<th>品牌</th>' +
		'<th>终端厂商</th>' +
		'<th>操作</th>' +
		'<th></th>' +
		'</tr>';
	for(var i = 0; i < data.length; i++) {
		str += '<tr><td>' + data[i].number + '</td>';
		str += '<td>' + data[i].emission + '</td>';
		str += '<td>' + data[i].purpose + '</td>';
		str += '<td>' + data[i].dependency + '</td>';
		str += '<td>' + data[i].truck_type + '</td>';
		str += '<td>' + data[i].truck_state + '</td>';
		str += '<td>' + data[i].model + '</td>';
		str += '<td>' + data[i].engine_type + '</td>';
		str += '<td>' + data[i].displacement + '</td>';
		str += '<td>' + data[i].owner + '</td>';
		str += '<td>' + data[i].phone + '</td>';
		str += '<td>' + data[i].register_ligeal + '</td>';
		str += '<td>' + data[i].register_date + '</td>';
		str += '<td>' + data[i].power_type + '</td>';
		str += '<td>' + data[i].parts_number + '</td>';
		str += '<td>' + data[i].brand + '</td>';
		str += '<td>' + data[i].device_factory + '</td>';
		str += '<td>' + data[i].op + '</td>';
		str += '<td><a href="javascript:void(0)" class="op" onclick="editManage(' + data[i].id + ')">编辑</a></br><a href="javascript:void(0)" class="op" onclick="delManage(' + data[i].id + ')">删除</a></td></tr>';
	}
	$('#Table').html('');
	$('#Table').append(str);
}
//load device table
function deviceTable(data) {
	var str = '<tr><th>设备编号</th>' +
		'<th>设备类型</th>' +
		'<th>品牌</th>' +
		'<th>型号</th>' +
		'<th>终端手机号</th>' +
		'<th>厂商</th>' +
		'<th>车牌</th>' +
		'<th>设备状态</th>' +
		'<th></th>' +
		'</tr>';
	for(var i = 0; i < data.length; i++) {
		str += '<tr><td>' + data[i].number + '</td>';
		str += '<td>' + data[i].device_type + '</td>';
		str += '<td>' + data[i].brand + '</td>';
		str += '<td>' + data[i].model + '</td>';
		str += '<td>' + data[i].mobile + '</td>';
		str += '<td>' + data[i].factory + '</td>';
		str += '<td>' + data[i].plate_number + '</td>';
		str += '<td>' + data[i].device_state + '</td>';
		str += '<td><a href="javascript:void(0)" class="op" onclick="editManage(' + data[i].id + ')">编辑</a></br><a href="javascript:void(0)" class="op" onclick="delManage(' + data[i].id + ')">删除</a></td></tr>';
	}
	$('#Table').html('');
	$('#Table').append(str);
}

function systemTable(data) {
	debugger;
	//	var str = '<tr><th>角色名称</th><td>测试</td></tr>';
	//	$('#Table').html('');
	//	$('#Table').append(str);
}
//重置添加的参数
function resetParams() {
	currentEditId = '';
	var a = $("#carManageForm input")
	$.each(a, function(name, object) {
		$(object).val('')
	});
	var b = $("#deviceManageForm input")
	$.each(b, function(name, object) {
		$(object).val('')
	});
	$('.truck_state').val('0'); //
	$('.device_state').val('0'); //
}

//保存，删除的URL
function getUpdateUrl(type) {
	switch(type) {
		case 'car':
			return url = domain + '/botron/saveTruck'
		case 'device':
			return url = domain + '/botron/saveDevice'
		default:
			break;
	}
}
//保存，删除的URL
function getQueryUrl(type) {
	switch(type) {
		case 'car':
			return url = domain + '/botron/queryTruck'
		case 'device':
			return url = domain + '/botron/queryDevice'
		default:
			break;
	}
}
//装在搜索类型
function loadSearchCondition() {
	var str = '<option value="0">请选择</option>';
	switch(currentType) {
		case 'itruck_truck_info':
			for(var i = 0; i < condition.car.length; i++) {
				str += '<option value="' + condition.car[i].code + '">' + condition.car[i].descr + '</option>'
			}
		case 'itruck_device_info':
			for(var i = 0; i < condition.device.length; i++) {
				str += '<option value="' + condition.device[i].code + '">' + condition.device[i].descr + '</option>'
			}
		default:
			break;
	}
	$('.search_condition').html('');
	$('.search_condition').append(str);
}