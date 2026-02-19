import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

const UPCOMING_LISTS = [
  {
    title: "90's Slashers",
    description: 'The golden age of horror',
    icon: 'movie_filter',
    gradient: 'linear-gradient(135deg, #4A0000, #B71C1C)',
  },
  {
    title: 'Classic Westerns',
    description: 'Timeless tales of the frontier',
    icon: 'filter_vintage',
    gradient: 'linear-gradient(135deg, #3E2000, #BF360C)',
  },
  {
    title: 'Sci-Fi Essentials',
    description: 'Foundations of the genre',
    icon: 'rocket_launch',
    gradient: 'linear-gradient(135deg, #001A33, #0277BD)',
  },
  {
    title: 'A24 Picks',
    description: 'Curated indie excellence',
    icon: 'local_movies',
    gradient: 'linear-gradient(135deg, #1A001A, #6A1B9A)',
  },
  {
    title: 'Asian Cinema',
    description: 'Masterpieces from the East',
    icon: 'theater_comedy',
    gradient: 'linear-gradient(135deg, #002020, #00695C)',
  },
  {
    title: 'Cult Classics',
    description: 'Films with devoted followings',
    icon: 'auto_awesome',
    gradient: 'linear-gradient(135deg, #1A1500, #F57F17)',
  },
] as const;

@Component({
  selector: 'cc-curated',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './curated.component.html',
  styleUrl: './curated.component.scss',
})
export class CuratedComponent {
  protected readonly upcomingLists = UPCOMING_LISTS;
}
