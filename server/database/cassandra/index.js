import cassandra from 'cassandra-driver'
export default new cassandra.Client({ contactPoints: ['127.0.0.1'], keyspace: 'hfks' })