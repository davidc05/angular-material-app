import { Routes } from '@angular/router';
import { IpDetailComponent } from './ip-detail/ip-detail.component';
import { IpDetailResolver } from './ip-detail/ip-detail.resolver';
import { IpQueryComponent } from './ip-query/ip-query.component';
import { LoginComponent } from './login/login.component';
import { LoginResolver } from './login/login.resolver';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { WatchlistResolver } from './watchlist/watchlist.resolver';
import { IpQueryResolver } from './ip-query/ip-query.resolver';
import { TrendsComponent } from './trends/trends.component';
import { TrendsResolver } from './trends/trends.resolver';
import { IpTagsComponent } from './ip-tags/ip-tags.component';
import { GmapComponent } from './gmap/gmap.component';
import { GmapResolver } from './gmap/gmap.resolver';
import { AdminComponent } from './admin/admin.component';
import { AdminResolver } from './admin/admin.resolver';
import { IpRangesComponent } from './ip-ranges/ip-ranges.component';
import { IpRangesResolver } from './ip-ranges/ip-ranges.resolver';
import { MyAccountComponent } from './my-account/my-account.component';
import { MyAccountResolver } from './my-account/my-account.resolver';

export const routes: Routes = [
	{
		path: '',
		redirectTo: '/login',
		pathMatch: 'full'
	},
	{
		path: 'query',
		component: IpQueryComponent,
		resolve: {
			isAuthenticated: LoginResolver
		}
	},
	{
		path: 'query/:queryType/:queryId',
		component: IpQueryComponent,
		resolve: {
			isAuthenticated: LoginResolver,
			queryData: IpQueryResolver,
		}
	},
	{
		path: 'network-name/:network',
		component: IpRangesComponent,
		resolve: {
			ipRanges: IpRangesResolver,
			isAuthenticated: LoginResolver
		}
	},
	{
		path: 'network-type/:network',
		component: IpRangesComponent,
		resolve: {
			ipRanges: IpRangesResolver,
			isAuthenticated: LoginResolver
		}
	},
	{
		path: 'isp-name/:ispName',
		component: IpRangesComponent,
		resolve: {
			ipRanges: IpRangesResolver,
			isAuthenticated: LoginResolver
		}
	},
	{
		path: 'network-group/:network',
		component: IpRangesComponent,
		resolve: {
			ipRanges: IpRangesResolver,
			isAuthenticated: LoginResolver
		}
	},
	{
		path: 'blacklist-neighbors/:blacklistNeighbors',
		component: IpRangesComponent,
		resolve: {
			ipRanges: IpRangesResolver,
			isAuthenticated: LoginResolver
		}
	},
	{
		path: 'watchlists',
		component: WatchlistComponent,
		resolve: {
			isAuthenticated: LoginResolver,
			data: WatchlistResolver,
		}
	},
	{
		path: 'login',
		component: LoginComponent
	},
	{
		path: 'admin',
		component: AdminComponent,
		resolve: {
			isAuthenticated: LoginResolver,
			isAdmin: AdminResolver
		}
	},
	{
		path: 'trends',
		component: TrendsComponent,
		resolve: {
			isAuthenticated: LoginResolver,
            data: TrendsResolver
		}
	},
	{
		path: 'tags',
		component: IpTagsComponent,
		resolve: {
			isAuthenticated: LoginResolver
		}
	},
	{
		path: 'map',
		component: GmapComponent,
		resolve: {
			isAuthenticated: LoginResolver,
			isLargePlanUser: GmapResolver
		}
	},
	{
		path: 'map/:queryType/:queryId',
		component: GmapComponent,
		resolve: {
			queryData: IpQueryResolver,
			isAuthenticated: LoginResolver,
			isLargePlanUser: GmapResolver
		}
	},
	{
		path: 'detail/:ipaddress',
		component: IpDetailComponent,
		resolve: {
			isAuthenticated: LoginResolver,
			data: IpDetailResolver
		}
	},
	{
		path: 'my-account/:tabId',
		component: MyAccountComponent,
		resolve: {
			tabId: MyAccountResolver
		}
	},
];
