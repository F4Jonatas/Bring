/* Version: 1.5.1
 * With this module you can import html files,
 * can add a filter to only load for mobile or desktop
 * and can add repetition to load the same file

 FIX: It is only importing files locally from server.


  Examples in HTML:
  Bring to desktop only:
    <div is="m-bring" data-media="desktop" data-src="./foo.html"></div>

  Bring to mobile only:
    <div is="m-bring" data-media="mobile" data-src="./foo.html"></div>

  Bring to both with repetition from the same file:
    <div is="m-bring" data-src="./foo.html" data-repeat="3"></div>

  Attributes:
    data-src   : [string/required] File path
                 This attribute specifies the URI of an external file.

    data-media : [string/optional] "desktop" or "mobile"
                 The media attribute specifies what media/device the target

    data-repeat: [integer/optional] Default: 1
                 Indicating the number of times to repeat.

    data-remove: [boolean/optional] "true" or "false". Defaul "true"
                 Remove attribute removes the gift which will not be used.

    data-event : [boolean/optional] Default: "true"
                 Triggers the event when the script is completely imported.


  Bring from JS:
    bring(
      [string/required] File path,
      [object/required] Node to append
    )


  Although the bring function is a promise, you can also use the Event Listener.
  WARN: The Event Listener will not be triggered when errors occur.
    document.addEventListener( 'bring', customevent => {} )

  Append html in body
    bring( './foo.html', document.body ).then().catch()
*/


const erudaregex = /^(\/\*! eruda)/
const pathregex  = /.*\//g
const ismobile   = !! navigator.userAgent.match( /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i )


// Export list to view imported files.
const importlist = []



const sendevent = ( type, detail ) => {
	document.dispatchEvent(
		new CustomEvent( type, { detail })
	)
}



const bring = async ( file, el ) => {
	if ( el.nodeName === '#document' )
		console.warn( 'The “document” element is not fully compatible.' )

		return fetch( file )
			.then( response => response.text() )
			.then( html => {
				// It is not expected that a number smaller than 0 will be used, but if it does, this check prevents errors.
				const repeat = Math.max( parseInt( el.dataset.repeat || 1 ), 0 )

				el.innerHTML = html.repeat( repeat )
				importlist.push( file )

				// WARN: Eruda creates large file.
				if ( window.eruda && ( el.children.length > 0 && erudaregex.test( el.children[0].text )))
					el.children[0].parentNode.removeChild( el.children[0] )


				const result = {
					node    : el,
					list    : importlist,
					path    : file,
					basename: file.replace( pathregex, '' )
				}

				// Trigger event on import completed.
				if ( this?.dataset.event.toLowerCase() !== 'false' )
					sendevent( 'bring', result )

				return result
			})
			.catch( err => err )
}



// https://source-docs.thunderbird.net/en/latest/frontend/custom_element_conventions.html
customElements.define( 'm-bring',
	class extends HTMLDivElement {
		constructor() {
			super()
		}



		async connectedCallback() {
			const remove = this?.dataset.remove ? this.dataset.remove.toLowerCase() : false
			const media  = this?.dataset.media  ? this.dataset.media.toLowerCase()  : false

			// INFO: Remove DOM that will not be used.
			if ( remove !== 'false'
			|| ( media && (( media === 'desktop' &&   ismobile )
			           ||  ( media === 'mobile'  && ! ismobile )) ))
				return this.remove()


			await bring( this.dataset.src, this )
		}
	},


	{ extends: 'div' }
)


export default bring
