// width代表x轴，height代表y轴，使用二维数组存储时Array[height][width]。

$ = function(id) {
  return document.getElementById(id);
}

window.onload = function() {
  var img = new Image();
  // img.crossOrigin = 'Anonymous';
  img.src = './90.png';
  img.onload = function() {
    scaleAndQuantize(this);
  }
}

function scaleAndQuantize(img) {
  var original_image = $('original');
  original_image.width = img.width;
  original_image.height = img.height;

  var canvas = original_image.getContext('2d');
  canvas.drawImage(img, 0, 0);
  var image_data = canvas.getImageData(0, 0, img.width, img.height);
  var data = image_data.data;

  var tmp_data = new Array();
  for (var i = 0, count = 0; i < img.height; i++) {
    tmp_data[i] = new Array();
    for (var j = 0; j < img.width; j++) {
      tmp_data[i][j] = data[count];
      count += 4;
    }
  }

  var resolution = [[192, 128], [96, 64], [48, 32], [24, 16], [12, 8], [300, 200], [450, 300], [500, 200]];
  for (var i = 0; i < resolution.length; i++) {
    var new_data = scale(tmp_data, resolution[i]);
    outputImage(new_data, 256);
  }

  var level = [128, 32, 8, 4, 2];
  for (var i = 0; i < level.length; i++) {
    var new_data = quantize(tmp_data, level[i]);
    outputImage(new_data, level[i]);
  }
}

function scale(input_img, size) {
  var old_h = input_img.length;
  var old_w = input_img[0].length;
  var new_w = size[0];
  var new_h = size[1];
  var w_radio = (old_w - 1) / (new_w - 1);
  var h_radio = (old_h - 1) / (new_h - 1);
  var data = new Array();

  for (var i = 0; i < new_h; i++) {
    data[i] = new Array();
    var old_h = Math.floor(h_radio * i);
    var h = h_radio * i - old_h;
    
    for (var j = 0; j < new_w; j++) {
      var old_w = Math.floor(w_radio * j);
      var w = w_radio * j - old_w;

      // 边界条件
      if (i == new_h - 1|| j == new_w - 1) {
        data[i][j] = input_img[old_h][old_w];
        continue;
      }

      var A = input_img[old_h][old_w];
      var B = input_img[old_h][old_w + 1];
      var C = input_img[old_h + 1][old_w];
      var D = input_img[old_h + 1][old_w + 1];

      // Y = A(1-w)(1-h) + B(w)(1-h) + C(h)(1-w) + Dwh
      var new_value = A * (1.0 - w) * (1.0 - h) + B * w * (1.0 - h) + C * h * (1.0 - w) + D * w * h;
      data[i][j] = Math.floor(new_value);
    }
  }

  return data;
}

function quantize(input_img, level) {
  var height = input_img.length;
  var width = input_img[0].length;
  var grey_unit = 256 / (level - 1);
  var data = new Array();

  for (var i = 0; i < height; i++) {
    data[i] = new Array();
    for (var j = 0; j < width; j++) {
      var grey_unit_length = level * input_img[i][j] / 256;
      data[i][j] = Math.floor(grey_unit_length) * Math.floor(grey_unit);
    }
  }
  console.log(data);
  return data;
}

function outputImage(new_data, grey_level) {
  var height = new_data.length;
  var width = new_data[0].length;

  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var image_data = canvas.getContext('2d').createImageData(width, height);
  var data = image_data.data;

  for (var i = 0, count = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      data[count++] = new_data[i][j];
      data[count++] = new_data[i][j];
      data[count++] = new_data[i][j];
      data[count++] = 255;
    }
  }

  canvas.getContext('2d').putImageData(image_data, 0, 0);

  var br = document.createElement('br');
  var span = document.createElement('span');
  var parent_node;
  if (grey_level != 256) {
    parent_node = $('quantization');
  } else {
    parent_node = $('scaling');
  }

  span.innerHTML = width + ' x ' + height + ', ' + grey_level + ' grey level.';
  parent_node.appendChild(canvas);
  parent_node.appendChild(span);
  parent_node.appendChild(br);
}

// function scale(input_img, size) {
//   var old_h = input_img.length;
//   var old_w = input_img[0].length;
//   var new_w = size[0];
//   var new_h = size[1];
//   var w_radio = Math.floor((old_w << 16) / new_w) + 1;
//   var h_radio = Math.floor((old_h << 16) / new_h) + 1;
//   var data = new Array();

//   for (var i = 0; i < new_h; i++) {
//     data[i] = new Array();
//     for (var j = 0; j < new_w; j++) {
//       var h = ((i * h_radio) >> 16);
//       var w = ((j * w_radio) >> 16);
//       data[i][j] = input_img[h][w];
//     }
//   }

//   return data;
// }
