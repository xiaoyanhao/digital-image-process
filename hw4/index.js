// width代表x轴，height代表y轴，使用二维数组存储时Array[height][width]。

$ = function(id) {
  return document.getElementById(id);
}

window.onload = function() {
  task1();
  task2();
  task3();
}

function inputImage(img, id) {
  var original_image = $(id);
  original_image.width = img.width;
  original_image.height = img.height;

  var canvas = original_image.getContext('2d');
  canvas.drawImage(img, 0, 0);
  var image_data = canvas.getImageData(0, 0, img.width, img.height);
  var data = image_data.data;

  var input_img = new Array(img.height);
  for (var i = 0, count = 0; i < img.height; i++) {
    input_img[i] = new Array(img.width);
    for (var j = 0; j < img.width; j++) {
      input_img[i][j] = data[count];
      count += 4;
    }
  }

  return input_img;
}

function generateMeanFilters() {
  var mean_filters = new Array(2);
  var averaging_size = [3, 9];
  var filter_size = averaging_size.length;

  for (var n = 0; n < filter_size; n++) {
    var size = averaging_size[n];
    mean_filters[n] = new Array(size);
    for (var i = 0; i < size; i++) {
      mean_filters[n][i] = new Array(size);
      for (var j = 0; j < size; j++) {
        mean_filters[n][i][j] = 1;
      }
    }
  }

  return mean_filters;
}

// 算术均值滤波
function arithmeticMeanFilter(input_img, filter) {
  var height = input_img.length;
  var width = input_img[0].length;
  var filter_size = filter.length;
  var half_size = Math.floor(filter_size / 2);
  var output_img = new Array(height);

  for (var i = 0; i < height; i++) {
    output_img[i] = new Array(width);
    for (var j = 0; j < width; j++) {
      var smooth_value = 0, mn = 0;

      for (var m = 0; m < filter_size; m++) {
        var h = i - half_size + m;
        if (h >= 0 && h < height) {
          for (var n = 0; n < filter_size; n++) {
            var w = j - half_size + n;
            if (w >= 0 && w < width) {
              smooth_value += filter[m][n] * input_img[h][w];
              mn++;
            }
          }
        }
      }

      output_img[i][j] = smooth_value / mn;
    }
  }

  return output_img;
}

// 几何均值滤波
function geometricMeanFilter(input_img, filter) {
  var height = input_img.length;
  var width = input_img[0].length;
  var filter_size = filter.length;
  var half_size = Math.floor(filter_size / 2);
  var output_img = new Array(height);

  for (var i = 0; i < height; i++) {
    output_img[i] = new Array(width);
    for (var j = 0; j < width; j++) {
      var smooth_value = 1, mn = 0;

      for (var m = 0; m < filter_size; m++) {
        var h = i - half_size + m;
        if (h >= 0 && h < height) {
          for (var n = 0; n < filter_size; n++) {
            var w = j - half_size + n;
            if (w >= 0 && w < width) {
              smooth_value *= filter[m][n] * input_img[h][w];
              mn++;
            }
          }
        }
      }

      output_img[i][j] = Math.pow(smooth_value, 1 / mn);
    }
  }

  return output_img;
}

// 调和均值滤波 
function harmonicMeanFilter(input_img, filter) {
  var height = input_img.length;
  var width = input_img[0].length;
  var filter_size = filter.length;
  var half_size = Math.floor(filter_size / 2);
  var output_img = new Array(height);

  for (var i = 0; i < height; i++) {
    output_img[i] = new Array(width);
    for (var j = 0; j < width; j++) {
      var smooth_value = 0, mn = 0;

      for (var m = 0; m < filter_size; m++) {
        var h = i - half_size + m;
        if (h >= 0 && h < height) {
          for (var n = 0; n < filter_size; n++) {
            var w = j - half_size + n;
            if (w >= 0 && w < width) {
              smooth_value += filter[m][n] * (1 / input_img[h][w]);
              mn++;
            }
          }
        }
      }

      output_img[i][j] = mn / smooth_value;
    }
  }

  return output_img;
}

// 反调和均值滤波
function contraharmonicaMeanFilter(input_img, filter, Q) {
  var height = input_img.length;
  var width = input_img[0].length;
  var filter_size = filter.length;
  var half_size = Math.floor(filter_size / 2);
  var output_img = new Array(height);

  for (var i = 0; i < height; i++) {
    output_img[i] = new Array(width);
    for (var j = 0; j < width; j++) {
      var numerator = 0, denominator = 0;

      for (var m = 0; m < filter_size; m++) {
        var h = i - half_size + m;
        if (h >= 0 && h < height) {
          for (var n = 0; n < filter_size; n++) {
            var w = j - half_size + n;
            if (w >= 0 && w < width) {
              numerator += filter[m][n] * Math.pow(input_img[h][w], Q + 1);
              denominator += filter[m][n] * Math.pow(input_img[h][w], Q);
            }
          }
        }
      }

      output_img[i][j] = numerator / denominator;
    }
  }

  return output_img;
}

// 中值滤波
function medianFilter(input_img, filter) {
  var height = input_img.length;
  var width = input_img[0].length;
  var filter_size = filter.length;
  var half_size = Math.floor(filter_size / 2);
  var output_img = new Array(height);

  for (var i = 0; i < height; i++) {
    output_img[i] = new Array(width);
    for (var j = 0; j < width; j++) {
      var neighbors = [];

      for (var m = 0; m < filter_size; m++) {
        var h = i - half_size + m;
        if (h >= 0 && h < height) {
          for (var n = 0; n < filter_size; n++) {
            var w = j - half_size + n;
            if (w >= 0 && w < width) {
              neighbors.push(input_img[h][w]);
            }
          }
        }
      }

      neighbors.sort(function(a, b) {
        return a - b;
      });

      var len = neighbors.length;
      if (len % 2 == 0) {
        output_img[i][j] = (neighbors[len / 2] + neighbors[len / 2 - 1]) / 2;
      } else {
        output_img[i][j] = neighbors[(len - 1) / 2]
      }
    }
  }

  return output_img;
}

// 最大值滤波
function maxFilter(input_img, filter) {
  var height = input_img.length;
  var width = input_img[0].length;
  var filter_size = filter.length;
  var half_size = Math.floor(filter_size / 2);
  var output_img = new Array(height);

  for (var i = 0; i < height; i++) {
    output_img[i] = new Array(width);
    for (var j = 0; j < width; j++) {
      var max_value = 0;

      for (var m = 0; m < filter_size; m++) {
        var h = i - half_size + m;
        if (h >= 0 && h < height) {
          for (var n = 0; n < filter_size; n++) {
            var w = j - half_size + n;
            if (w >= 0 && w < width) {
              max_value = Math.max(input_img[h][w], max_value);
            }
          }
        }
      }

      output_img[i][j] = max_value;
    }
  }

  return output_img;
}

// 最小值滤波
function minFilter(input_img, filter) {
  var height = input_img.length;
  var width = input_img[0].length;
  var filter_size = filter.length;
  var half_size = Math.floor(filter_size / 2);
  var output_img = new Array(height);

  for (var i = 0; i < height; i++) {
    output_img[i] = new Array(width);
    for (var j = 0; j < width; j++) {
      var min_value = 255;

      for (var m = 0; m < filter_size; m++) {
        var h = i - half_size + m;
        if (h >= 0 && h < height) {
          for (var n = 0; n < filter_size; n++) {
            var w = j - half_size + n;
            if (w >= 0 && w < width) {
              min_value = Math.min(input_img[h][w], min_value);
            }
          }
        }
      }

      output_img[i][j] = min_value;
    }
  }

  return output_img;
}



function outputImage(new_data, parent_id) {
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
  var parent_node = $(parent_id);
  parent_node.appendChild(canvas);
  parent_node.appendChild(br);
}
