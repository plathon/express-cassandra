import cassandra from '../../../../database/cassandra'
import random from '../../../../lib/random'
import slug from 'slug'

////////////////////////////////////////////
//////          WARNING           ///////////
///// NOT USE THIS IN PRODUCTION //////////
///////////////////////////////////////////



export default {

	/**
	* Generate a uniq slug to user
	**/

	generate: (fullName, cb) => {

		let slugName = slug( fullName,
			{ lower: true, 
			  replacement: '',
			  symbols: false,
			  charmap: slug.charmap,
			  multicharmap: slug.multicharmap
			}
		)

		let slugQuery = 'SELECT COUNT(*) FROM users WHERE slug = ?'
		cassandra.execute(slugQuery, [ slugName ], { prepare: true }, (err, res) => {
			if (err) return cb(err)
			if (!parseInt(res.rows[0].count))
				cb(null, slugName)
			else {
				let slugAppend = random.generate(8, '0123456789abcdefghijklmnopqrstuvwxyz')
				slugName = slugName + slugAppend
				cb(null, slugName)
			}
		})

	}

}