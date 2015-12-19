function task3() {
  var img = new Image();
  img.src = '../public/images/hw4_task_3.png';

  img.onload = function() {
    var input_img = inputColorImage(this, 'task3_original_image');
    var output_img = new Array(3);
    var histograms = new Array(3);

    for (var n = 0; n < 3; n++) {
      var histogram = getHistogram(input_img[n]);
      output_img[n] = equalize_hist(input_img[n], histogram);
    }
    outputColorImage(output_img, 'rgb_equalize_hist_1');

    for (var n = 0; n < 3; n++) {
      histograms[n] = getHistogram(input_img[n]);
    }
    var mean_histogram = getMeanHistogram(histograms);
    for (var n = 0; n < 3; n++) {
      output_img[n] = equalize_hist(input_img[n], mean_histogram);
    }
    outputColorImage(output_img, 'rgb_equalize_hist_2');
  };
}

function inputColorImage(img, id) {
  var original_image = $(id);
  original_image.width = img.width;
  original_image.height = img.height;

  var canvas = original_image.getContext('2d');
  canvas.drawImage(img, 0, 0);
  var image_data = canvas.getImageData(0, 0, img.width, img.height);
  var data = image_data.data;

  var input_img = new Array(3);
  for (var n = 0; n < 3; n++) {
    input_img[n] = new Array(img.height);
  }
  for (var i = 0, count = 0; i < img.height; i++) {
    for (var n = 0; n < 3; n++) {
      input_img[n][i] = new Array(img.width);
    }
    for (var j = 0; j < img.width; j++, count++) {
      for (var n = 0; n < 3; n++, count++) {
        input_img[n][i][j] = data[count];
      }
    }
  }    

  return input_img;
}


function getPixelCDF(pixel_pdf) {
  var pixel_cdf = [];

  for (var i = 0, cumulation = 0; i < 256; i++) {
    cumulation += pixel_pdf[i];
    pixel_cdf[i] = cumulation;
  }

  return pixel_cdf;
}


function equalize_hist(input_img, pixel_pdf) {
  var height = input_img.length;
  var width = input_img[0].length;
  var pixel_cdf = getPixelCDF(pixel_pdf);
  var output_img = new Array(height);

  for (var i = 0; i < height; i++) {
    output_img[i] = new Array(width);
    for (var j = 0; j < width; j++) {
      var grey_value = 255 * pixel_cdf[input_img[i][j]] / (width * height);
      output_img[i][j] = Math.round(grey_value);
    }
  }

  return output_img;
}

function getHistogram(input_img) {
  var height = input_img.length;
  var width = input_img[0].length;
  var histogram = [];

  for (var i = 0; i < 256; i++) {
    histogram[i] = 0;
  }

  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      histogram[input_img[i][j]]++;
    }
  }

  return histogram;
}

function getMeanHistogram(histograms) {
  var histogram = [];
  var len = histograms.length;

  for (var i = 0; i < 256; i++) {
    histogram[i] = 0;
    for (var j = 0; j < len; j++) {
      histogram[i] += histograms[j][i];
    }
    histogram[i] /= len;
  }

  return histogram;
}


function outputColorImage(output_img, parent_id) {
  var height = output_img[0].length;
  var width = output_img[0][0].length;

  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var image_data = canvas.getContext('2d').createImageData(width, height);
  var data = image_data.data;

  for (var i = 0, count = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      for (var n = 0; n < 3; n++, count++) {
        data[count] = output_img[n][i][j];
      }
      data[count++] = 255;
    }
  }

  canvas.getContext('2d').putImageData(image_data, 0, 0);

  var br = document.createElement('br');
  var parent_node = $(parent_id);
  parent_node.appendChild(canvas);
  parent_node.appendChild(br);
}

