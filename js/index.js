var search_terms = ['hurricane', 'tsunami', 'earthquake', 'hospital', 'fire', 'tornado', 'blizzard', 'homeless', 'food', 'flood', 'sandstorm', 'shelter', 'post-disaster'];

function autocompleteMatch(input) {
input = input.toLowerCase();
  if (input == '') {
    return [];
  }
  var reg = new RegExp(input)
  return search_terms.filter(function(term) {
	  if (term.match(reg)) {
  	  return term;
	  }
  });
}

function showResults(val) {
  res = document.getElementById("autocomplete-results");
  res.innerHTML = '';
  let list = '';
  let terms = autocompleteMatch(val);
  for (i=0; i<terms.length; i++) {
    list += '<li>' + terms[i] + '</li>';
  }
  res.innerHTML = '<ul>' + list + '</ul>';
}
