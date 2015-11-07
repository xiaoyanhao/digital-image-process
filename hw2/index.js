// width代表x轴，height代表y轴，使用二维数组存储时Array[height][width]。

$ = function(id) {
  return document.getElementById(id);
}

window.onload = function() {
  var img = new Image();
  // img.crossOrigin = 'Anonymous';
  img.src = '../public/images/hw2.png';
  img.onload = function() {
    histogramEqualizationAndSpatialFiltering(this);
  }
}

function histogramEqualizationAndSpatialFiltering(img) {
  var original_image = $('original_image');
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

  displayHistogram(tmp_data, 'original');

  // 直方图均衡化
  var new_data;
  new_data = equalize_hist(tmp_data);
  outputImage(new_data, 'equalize_hist');
  displayHistogram(new_data, 'equalize_hist');

  // 均值滤波
  var averaging_filters = new Array();
  var averaging_size = [3, 7, 11];
  for (var n = 0; n < 3; n++) {
    averaging_filters[n] = new Array();
    var size = averaging_size[n];
    for (var i = 0; i < size; i++) {
      averaging_filters[n][i] = new Array();
      for (var j = 0; j < size; j++) {
        averaging_filters[n][i][j] = 1 / (size * size);
      }
    }
  }

  for (var i = 0; i < 3; i++) {
    new_data = filter2d(tmp_data, averaging_filters[i]);
    outputImage(new_data, 'averaging_filter');
  }

  // 拉普拉斯滤波
  var laplace_filters = [
    [[0, 1, 0], [1, -4, 1], [0, 1, 0]],
    [[0, -1, 0], [-1, 4, -1], [0, -1, 0]],
    [[1, 1, 1], [1, -8, 1], [1, 1, 1]],
    [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]]
  ];
  for (var i = 0; i < 4; i++) {
    new_data = filter2d(tmp_data, laplace_filters[i]);
    outputImage(new_data, 'laplace_filter');
  }

  // 高提升滤波
  new_data = filter2d.highBoostFilter(tmp_data);
  outputImage(new_data, 'high_boost_filter');
}

function calculateCDF(image_data) {
  var height = image_data.length;
  var width = image_data[0].length;
  var pixel_CDF = [], pixel_num = [];

  for (var i = 0; i < 256; i++) {
    pixel_num.push(0);
  }

  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      pixel_num[image_data[i][j]]++;
    }
  }

  for (var i = 0, cumulation = 0; i < 256; i++) {
    cumulation += pixel_num[i];
    pixel_CDF[i] = cumulation;
  }

  return pixel_CDF;
}

function equalize_hist(input_img) {
  var height = input_img.length;
  var width = input_img[0].length;
  var pixel_CDF = calculateCDF(input_img);
  var output_img = new Array();

  for (var i = 0; i < height; i++) {
    output_img[i] = new Array();
    for (var j = 0; j < width; j++) {
      var grey_value = 255 * pixel_CDF[input_img[i][j]] / (width * height);
      output_img[i][j] = Math.round(grey_value);
    }
  }

  return output_img;
}

function displayHistogram(image_data, parent_id) {
  var height = image_data.length;
  var width = image_data[0].length;
  var pixel = [], pixel_num = [];

  for (var i = 0; i < 256; i++) {
    pixel.push('');
    pixel_num.push(0);
  }
  pixel[0] = 0, pixel[255] = 255;

  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      pixel_num[image_data[i][j]]++;
    }
  }

  var data = {
    labels: pixel,
    datasets: [
      {
        label: parent_id,
        fillColor: 'rgba(220,220,220,0.5)',
        strokeColor: 'rgba(220,220,220,0.8)',
        highlightFill: 'rgba(220,220,220,0.75)',
        highlightStroke: 'rgba(220,220,220,1)',
        data: pixel_num
      }
    ]
  };

  var options = {
    //Boolean - If there is a stroke on each bar
    barShowStroke: false,
    //Number - Spacing between each of the X value sets
    barValueSpacing: 0,
  };


  var histogram = document.createElement('canvas');
  histogram.width = 900;
  histogram.height = 400;
  $(parent_id).appendChild(histogram);
  var ctx = histogram.getContext('2d');
  new Chart(ctx).Bar(data, options);
}

function filter2d(input_img, filter) {
  var height = input_img.length;
  var width = input_img[0].length;
  var filter_size = filter.length;
  var half_size = Math.floor(filter_size / 2);
  var output_img = new Array();


  for (var i = 0; i < height; i++) {
    output_img[i] = new Array();
    for (var j = 0; j < width; j++) {
      var smooth_value = 0;

      for (var m = 0; m < filter_size; m++) {
        var h = i - half_size + m;
        if (h < 0 || h >= height) {
          continue;
        }
        for (var n = 0; n < filter_size; n++) {
          var w = j - half_size + n;
          if (w < 0 || w >= width) {
            continue;
          }
          smooth_value += filter[m][n] * input_img[h][w];
        }
      }

      output_img[i][j] = Math.round(smooth_value);
    }
  }

  return output_img;
}

filter2d.highBoostFilter = function(input_img) {
  var height = input_img.length;
  var width = input_img[0].length;
  var averaging_filter = new Array();
  var output_img = new Array();

  for (var i = 0; i < 3; i++) {
    averaging_filter[i] = new Array();
    for (var j = 0; j < 3; j++) {
      averaging_filter[i][j] = 1 / 9;
    }
  }

  var blur_img = filter2d(input_img, averaging_filter);

  for (var i = 0; i < height; i++) {
    output_img[i] = new Array();
    for (var j = 0; j < width; j++) {
      output_img[i][j] = input_img[i][j] + 4.5 * (input_img[i][j] - blur_img[i][j]);
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

// 按比例标定像素值范围
// function calibration(image_data) {
//   var height = image_data.length;
//   var width = image_data[0].length;
//   var max = -999999999, min = -max;

//   for (var i = 0; i < height; i++) {
//     for (var j = 0; j < width; j++) {
//       max = (max > image_data[i][j] ? max : image_data[i][j]);
//       min = (min < image_data[i][j] ? min : image_data[i][j]);
//     }
//   }

//   for (var i = 0; i < height; i++) {
//     for (var j = 0; j < width; j++) {
//       var new_value = 255 * (image_data[i][j] - min) / (max - min);
//       image_data[i][j] = Math.round(new_value);
//     }
//   }

//   return image_data;
// }
