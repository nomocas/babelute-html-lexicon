import Scopes from 'babelute/src/pragmatics/pragmatics-scopes';
import Agora from 'agoravox';
import AsyncAggregator from 'async-collector';
export default class HTMLScopes extends Scopes {
	constructor(scope) {
		super(scope);
		this.scope.async = new AsyncAggregator();
		this.scope.agora = new Agora();
	}
}
