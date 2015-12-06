// width代表x轴，height代表y轴，使用二维数组存储时Array[height][width]。

$ = function(id) {
  return document.getElementById(id);
}

function complex(r, i)  {
  return {real: r, imaginary: i};
}

function complexAdd(a, b) {
  return {real: a.real + b.real, imaginary: a.imaginary + b.imaginary};
}

function complexSub(a, b) {
  return {real: a.real - b.real, imaginary: a.imaginary - b.imaginary};
}

function complexMulti(a, b) {
  return {
    real: a.real * b.real - a.imaginary * b.imaginary,
    imaginary: a.real * b.imaginary + a.imaginary * b.real
  };
}

function magnitude(c) {
  return Math.sqrt(c.real * c.real + c.imaginary * c.imaginary);
}


window.onload = function() {
  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = '../public/images/hw2.png';
  img.onload = inputImage;
}

function inputImage() {
  img = this;
  var original_image = $('original_image');
  original_image.width = img.width;
  original_image.height = img.height;

  var canvas = original_image.getContext('2d');
  canvas.drawImage(img, 0, 0);
  var image_data = canvas.getImageData(0, 0, img.width, img.height);
  var data = image_data.data;

  var complex_data = new Array(img.height);
  for (var i = 0, count = 0; i < img.height; i++) {
    complex_data[i] = new Array(img.width);
    for (var j = 0; j < img.width; j++) {
      var flag = ((i + j) % 2 == 0 ? 1 : -1);
      complex_data[i][j] = complex(data[count] * flag, 0); //中心化
      count += 4;
    }
  }

  testForDFT(complex_data);
  testForFFT(complex_data);

  for (var i = 0, count = 0; i < img.height; i++) {
    for (var j = 0; j < img.width; j++) {
      complex_data[i][j] = complex(data[count], 0); // 不需要中心化，否则会有重影。
      count += 4;
    }
  }

  testForFrequencyFilter(complex_data);
}


// log变换
function logTransformation(input_img) {
  var height = input_img.length;
  var width = input_img[0].length;
  var output_img = new Array(height), max_value = 0;

  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      max_value = Math.max(max_value, magnitude(input_img[i][j]));
    }
  }

  var c = 255 / Math.log(1 + max_value);

  for (var i = 0; i < height; i++) {
    output_img[i] = new Array(width);
    for (var j = 0; j < width; j++) {
      output_img[i][j] = c * Math.log(1 + magnitude(input_img[i][j]));
    }
  }

  return output_img;
}

// 获取复数的实部的绝对值作为输出图像
function getRealFromComplex(input_img) {
  var height = input_img.length;
  var width = input_img[0].length;
  var output_img = new Array(height);

  for (var i = 0; i < height; i++) {
    output_img[i] = new Array(width);
    for (var j = 0; j < width; j++) {
      output_img[i][j] = Math.abs(input_img[i][j].real);
    }
  }

  return output_img;
}

// 填充0
function paddingWithZero(input_img, padded_height, padded_width) {
  var height = input_img.length;
  var width = input_img[0].length;

  var padded_img = new Array(padded_height);
  for (var i = 0; i < padded_height; i++) {
    padded_img[i] = new Array(padded_width);
    for (var j = 0; j < padded_width; j++) {
      if (i < height && j < width) {
        padded_img[i][j] = input_img[i][j];
      } else {
        padded_img[i][j] = complex(0, 0);
      }
    }
  }

  return padded_img;
}

// 扩展大小为2次幂
function expandToTwoPower(input_img) {
  var height = input_img.length, padded_height;
  var width = input_img[0].length, padded_width;

  // 扩展长宽为2次幂
  for (var i = 0, h_flag = false, w_flag = false; ; i++) {
    var power = Math.pow(2, i);
    if (!h_flag && power > height) {
      padded_height = power;
      h_flag = true;
    }
    if (!w_flag && power > width) {
      padded_width = power;
      w_flag = true;
    }
    if (h_flag && w_flag) {
      break;
    }
  }

  return paddingWithZero(input_img, padded_height, padded_width);
}


// 傅立叶变换
function testForDFT(input_img) {
  var output_img = dft2d(input_img, 'DFT');
  outputImage(logTransformation(output_img), 'DFT');
  output_img = dft2d(output_img, 'IDFT');
  outputImage(getRealFromComplex(output_img), 'IDFT');
}

function dft2d(input_img, flags) {
  var height = input_img.length;
  var width = input_img[0].length;
  var inverse = (flags == 'DFT' ? -1 : 1);
  var output_img = new Array(height);

  for (var i = 0; i < height; i++) {
    output_img[i] = dft1d(input_img[i], inverse);
  }

  for (var i = 0; i < width; i++) {
    var tmp_img = new Array(height)
    for (var j = 0; j < height; j++) {
      tmp_img[j] = output_img[j][i];
    }
    tmp_img = dft1d(tmp_img, inverse);
    for (var j = 0; j < height; j++) {
      output_img[j][i] = tmp_img[j];
    }
  }

  return output_img;
}

function dft1d(input_img, inverse) {
  var N = input_img.length;
  var output_img = new Array(N);

  for (var i = 0; i < N; i++) {
    output_img[i] = complex(0, 0);
    for (var j = 0; j < N; j++) {
      var x = inverse * 2 * Math.PI * (i * j / N);
      var cos = Math.cos(x);
      var sin = Math.sin(x);
      var comp = complexMulti(input_img[j], complex(cos, sin));
      output_img[i] = complexAdd(output_img[i], comp);      
    }
    if (inverse == -1) {
      output_img[i] = complexMulti(output_img[i], complex(1 / N, 0));
    }
  }

  return output_img;
}


// 快速傅立叶变换
function testForFFT(input_img) {
  var padded_img = expandToTwoPower(input_img), output_img;

  output_img = fft2d(padded_img, 'FFT');
  outputImage(logTransformation(output_img), 'FFT');
  output_img = fft2d(output_img, 'IFFT');
  outputImage(getRealFromComplex(output_img), 'IFFT');
}

function fft2d(input_img, flags) {
  var height = input_img.length;
  var width = input_img[0].length;
  var inverse = (flags == 'FFT' ? -1 : 1);
  var output_img = new Array(height);

  for (var i = 0; i < height; i++) {
    output_img[i] = fft1d(input_img[i], width, inverse);
  }

  for (var i = 0; i < width; i++) {
    var tmp_img = new Array(height)
    for (var j = 0; j < height; j++) {
      tmp_img[j] = output_img[j][i];
    }
    tmp_img = fft1d(tmp_img, height, inverse);
    for (var j = 0; j < height; j++) {
      output_img[j][i] = tmp_img[j];
    }
  }

  return output_img;
}

function fft1d(input_img, N, inverse) {
  var output_img = new Array(N);

  if (N == 1) {
    output_img[0] = input_img[0];
    return output_img;
  }

  var even = new Array(N / 2);
  var odd = new Array(N / 2);
  for (var i = 0; i < N / 2; i++) {
    even[i] = input_img[2 * i];
    odd[i] = input_img[2 * i + 1];
  }

  even = fft1d(even, N / 2, inverse);
  odd = fft1d(odd, N / 2, inverse);

  for (var i = 0; i < N / 2; i++) {
    var x = inverse * 2 * Math.PI * i / N;
    var cos = Math.cos(x);
    var sin = Math.sin(x);
    odd[i] = complexMulti(odd[i], complex(cos, sin));
    output_img[i] = complexAdd(even[i], odd[i]);
    output_img[i + N / 2] = complexSub(even[i], odd[i]);
    if (inverse == -1) {
      var half = complex(1 / 2, 0);
      output_img[i] = complexMulti(half, output_img[i]);
      output_img[i + N / 2] = complexMulti(half, output_img[i + N / 2]);
    }
  }

  return output_img;
}


// 频域滤波
function testForFrequencyFilter(input_img) {
  var N = 7, output_img, padded_img;
  var height = input_img.length;
  var padded_height = height + N;
  var width = input_img[0].length;
  var padded_width = width + N;
  var laplace_filter = [
    [complex(0, 0), complex(1, 0), complex(0, 0)],
    [complex(1, 0), complex(-4, 0), complex(1, 0)],
    [complex(0, 0), complex(1, 0), complex(0, 0)],
  ];

  var averaging_filter = new Array(N);
  for (var i = 0; i < N; i++) {
    averaging_filter[i] = new Array(N);
    for (var j = 0; j < N; j++) {
      averaging_filter[i][j] = complex(1 / (N * N), 0);
    }
  }

  padded_img = paddingWithZero(input_img, padded_height, padded_width);
  padded_img = expandToTwoPower(padded_img);

  averaging_filter = paddingWithZero(averaging_filter, padded_height, padded_width);
  averaging_filter = expandToTwoPower(averaging_filter);
  output_img = filter2d_freq(padded_img, averaging_filter);
  outputImage(logTransformation(output_img), 'averaging_filter');

  laplace_filter = paddingWithZero(laplace_filter, padded_height, padded_width);
  laplace_filter = expandToTwoPower(laplace_filter);
  output_img = filter2d_freq(padded_img, laplace_filter);
  outputImage(logTransformation(output_img), 'laplace_filter');
}

function filter2d_freq(input_img, filter) {
  var F = fft2d(input_img, 'FFT');
  var H = fft2d(filter, 'FFT');
  var G = matrixMulti(F, H);
  return fft2d(G, 'IFFT');
}

function matrixMulti(a, b) {
  var height = a.length;
  var width = a[0].length;
  var result = new Array(height);

  for (var i = 0; i < height; i++) {
    result[i] = new Array(width);
    for (var j = 0; j < width; j++) {
      result[i][j] = complexMulti(a[i][j], b[i][j]);
    }
  }

  return result;
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
