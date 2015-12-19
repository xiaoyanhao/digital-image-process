function task1() {
  var img = new Image();
  img.src = '../public/images/hw4_task_1.png';

  img.onload = function() {
    var input_img = inputImage(this, 'task1_original_image');
    var mean_filters = generateMeanFilters();
    var filter_size = mean_filters.length;
    var output_img;

    for (var i = 0; i < filter_size; i++) {
      output_img = arithmeticMeanFilter(input_img, mean_filters[i]);
      outputImage(output_img, 'arithmetic_mean_filter');
      output_img = harmonicMeanFilter(input_img, mean_filters[i]);
      outputImage(output_img, 'harmonic_mean_filter');
      output_img = contraharmonicaMeanFilter(input_img, mean_filters[i], -1.5);
      outputImage(output_img, 'contraharmonic_mean_filter');
    }
  };
}
