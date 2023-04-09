export download = (tree, fileName) =>
	blob = new Blob [JSON.stringify tree], type: 'application/json'
	a = document.createElement 'a'
	a.download = fileName
	a.href = URL.createObjectURL blob
	a.target = '_blank'
	a.click()
	URL.revokeObjectURL a.href

	#document.querySelector('button').onclick = () =>
	#downloadFile 'https://www.google-analytics.com/analytics.js', 'gooleAnalytics.js'